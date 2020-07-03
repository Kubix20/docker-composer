/* eslint import/no-webpack-loader-syntax: off */
/* eslint  no-undef: off */
import "script-loader!mxgraph/javascript/mxClient.js";

import React, { Component } from "react";
import ReactDOM from "react-dom";
import { safeDump, safeLoad } from 'js-yaml';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import SplitPane from 'react-split-pane';
import ToolBar from './components/toolbar';
import SideBar from './components/sidebar';
import PropertiesSelector from './components/properties/propertiesSelector';
import Constants from './constants';
import Monitors from './components/monitors';
import ServiceLabel from './components/graph/serviceLabel';
import VolumeLabel from './components/graph/volumeLabel';
import NetworkLabel from './components/graph/networkLabel';
import ConfigLabel from './components/graph/configLabel';
import SecretLabel from './components/graph/secretLabel';
import { cleanService, readPorts, readBuild, readVolume, readLink, readExternal, readUlimits, readConfigOrSecret, readKeyValues, readCommandValues, readSingleArrayValues, setConfigMode, setNodeProps, getPathVariable } from './utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSearchPlus, faSearchMinus, faCompressArrowsAlt, faTrash, faCaretRight, faCaretLeft } from '@fortawesome/free-solid-svg-icons';
import submenuIcon from './assets/submenu.gif';
import { upAll, down } from './scripts/compose';
const { app, dialog } = require('electron').remote;
const path = require('path');
const fs = require('fs');

const RunningState = Object.freeze({
  off: 'off',
  starting: 'starting',
  warning: 'warning',
  running: 'running'
});

export default class App extends Component {
  constructor(props) {
    super(props);

    this.divGraph = React.createRef();
    this.sidebarToggle = React.createRef();
    this.sidebarContainer = React.createRef();

    this.tmpFileCreated = false;
    this.activeProcessPids = [];
    this.upProcess = null;
    this.downProcess = null;
    this.forceStopping = false;
    this.action = null;

    this.monitorsDimensions = {
      max: 200,
      min: 34
    }

    this.state = {
      sidebarHidden: false,
      mainPanelSize: window.innerHeight-this.monitorsDimensions.min,
      graph: null,
      display: "none",
      isReady: false,
      output: "",
      cwd: path.join(app.getAppPath(), Constants.paths.DEFAULT_PROJECT_DIR),
      loadedFileName: null, 
      loading: false,
      modalMsg: "",
      modalShow: false,

      runningState: RunningState.off,
      runningServicesMap: {},
      alerts: [],
    };
  }

  componentDidMount() {
    this.LoadGraph();
  }

  handleHide = () => { this.setState({modalShow: false})}

  handleConfirm = () => { this.handleHide(); this.action(); }

  openModal = (msg) => {
    this.setState({modalShow: true, modalMsg: msg})
  }

  handleStartExit = (pid) => {
    this.removeFromActivePids(pid);
    for(let key in this.state.runningServicesMap){
        const service = this.state.runningServicesMap[key];
        service.container.status = 'off';
        this.state.graph.updateView(service);
    }
    this.setState({runningState: RunningState.off });
  }

  updateServiceState = (containerName, state) => {
    let serviceName = containerName;
    if(containerName.includes('_')){
      const containerNameParts = containerName.split('_');
      serviceName = containerNameParts[containerNameParts.length - 2];
    }
    let service =  this.state.runningServicesMap[serviceName];
    service.container.status = state;
    this.state.graph.updateView(service);
    this.updateRunningState();
  }

  addServiceLog = (containerName, log) => {
    let serviceKey = containerName;
    if(containerName.includes('_'))
      serviceKey = containerName.split('_')[0];
    let service = this.state.runningServicesMap[serviceKey];
    service.container.logs += log;
  }

  removeFromActivePids = (pid) => {
    this.activeProcessPids = this.activeProcessPids.filter( p => p !== pid );
  }

  addActivePid = (pid) => {
    if(pid)
      this.activeProcessPids.push(pid);;
  }

  handleError = (pid, err) => {
    this.removeFromActivePids(pid);
    this.addAlert(err.toString());
  }

  handleStdout = (pid, data) => {
    if(!this.activeProcessPids.includes(pid))
      return;
    
    const logs = data.split('\n');
    if(logs[logs.length-1] === '')
      logs.pop();

    for (let entry of logs) {
      let components = entry.split('|');

      if (components.length >= 2) {
        // Container log message
        const containerName = components[0].trim();
        this.addServiceLog(containerName, entry+'\n');   
      }
      else if (entry.includes('exited with code')) {
        // Container exit message
        const containerName = entry.split(' ')[0].trim();
        this.updateServiceState(containerName, 'off');
      }
      else if(entry === "Gracefully stopping... (press Ctrl+C again to force)")
        return;
      else if(entry.includes('[yN]'))
        return;
    }

    this.setState({ output: this.state.output + data });
  }

  handleStderr = (pid, data) => {
    if(!this.activeProcessPids.includes(pid))
      return;

    let components = [];
    if((components = data.match(/(?:(?:Re)?[C|c]reating|(?:Re)?[S|s]tarting) (.*) ... done/)) !== null){
      const containerName = components[1].split(' ')[0].trim();
      this.updateServiceState(containerName, 'running');
    }
    else if((components = data.match(/(?:[S|s]topping|[K|k]illing) (.*) ... done/)) !== null){
      const containerName = components[1].split(' ')[0].trim();
      this.updateServiceState(containerName, 'off');
    }
    else if(data.includes('is up-to-date')){
      const containerName = data.split(' ')[0].trim();
      this.updateServiceState(containerName, 'running');
    }

    this.setState({ output: this.state.output + data });
  }

  updateCwd = () => {
    const handler = (res) => {
      const dir = res.filePaths[0];
      if (dir) {

        // Set working directory to opened location
        this.setState({ cwd: dir });
      }
    };
    
    this.openFileDialog('dir', handler);
  }

  addAlert = (msg) => {
    this.setState({
      alerts: [...this.state.alerts, msg]
    });

    setTimeout(() => {
      this.setState({ alerts: [...this.state.alerts.filter((a) => a !== msg)] });
    }, 3000)
  }

  expandMonitors = () => {
    this.setState({mainPanelSize: window.innerHeight-this.monitorsDimensions.max});
  }

  collapseMonitors = () => {
    let collapsedHeight = window.innerHeight-this.monitorsDimensions.min;
    collapsedHeight += this.state.mainPanelSize === collapsedHeight ? 1 : 0; 
    this.setState({mainPanelSize: collapsedHeight});
  }

  makeDraggable = (obj, info, handleDrop) => {    
    // Creates the image which is used as the drag icon (preview)
    let dragElt = document.createElement('div');
    dragElt.style.border = 'dashed black 1px';
    dragElt.style.width = '250px';
    dragElt.style.height = '327px';

    mxUtils.makeDraggable(obj, this.state.graph, handleDrop, dragElt, 0, 0, true, true);
  }

  toggleSidebar = () => {
    this.sidebarContainer.current.classList.toggle("hidden");
    this.setState({ sidebarHidden: !this.state.sidebarHidden });
  }

  updateRunningState(){

    let runningContainers = 0;
    for(let key in this.state.runningServicesMap){
      if(this.state.runningServicesMap[key].container.status === 'running')
        runningContainers++;
    }

    let nextRunningState = RunningState.off;
    if(runningContainers === Object.keys(this.state.runningServicesMap).length)
      nextRunningState = RunningState.running;
    else if(runningContainers > 0)
      nextRunningState = RunningState.warning;

    this.setState({runningState: nextRunningState});
  }

  setLoading = (loading) => {
    this.divGraph.current.classList.toggle("blur");
    this.setState({ loading: loading });
  }

  createTmpComposeFile = (data) => {
    fs.mkdirSync(this.state.cwd, { recursive: true });
    fs.writeFileSync(path.join(this.state.cwd, Constants.paths.TMP_DOCKER_COMPOSE), data);    
    this.tmpFileCreated = true;
  }

  deleteTmpComposeFile = (path) => {
    console.log("deleting file");
    if(!path)
      path = path.join(this.state.cwd, Constants.paths.TMP_DOCKER_COMPOSE);

    try{
      fs.unlinkSync(path);
    }
    catch(e){
      console.log(e);
    }
  }

  removeTmpComposeFile = () => {
    if(!this.tmpFileCreated)
      return;
    
    const tmpFilePath = path.join(this.state.cwd, Constants.paths.TMP_DOCKER_COMPOSE)

    down({
      cwd: this.state.cwd, 
      composeOptions: ['--no-ansi', '-f', Constants.paths.TMP_DOCKER_COMPOSE],
      commandOptions: ['-v']
    }, { 
      onStdout: (data) => console.log(data),
      onStderr: (data) => console.log(data),
      onExit: () => this.deleteTmpComposeFile(tmpFilePath)
    });

    this.tmpFileCreated = false;
  }

  handleStart = () => {

    let commandOptions = [];

    // Create service map
    let runningServicesMap = {};
    const model = this.state.graph.getModel();
    for (let key in model.cells) {
      const cell = model.cells[key];
      if (cell.vertex && cell.type === 'service') {
        cell.container.logs = "";

        let serviceName = cell.getAttribute('name');
        if(cell.props.container_name)
          serviceName = cell.props.container_name;

        runningServicesMap[serviceName] = cell;
        // runningServicesMap[cell.getAttribute('name')] = cell;

        // Check if secrets are used

        console.log(cell.children);
        if(cell.children[5].edges)
          commandOptions.push('--force-recreate');
      }
    }

    console.log(commandOptions);

    console.log(runningServicesMap);

    this.forceStopping = false;
    this.setState({ output: "", runningServicesMap: runningServicesMap });

    const json = this.state.graph.modelToJson();
    const res = safeDump(json);

    try{
      this.createTmpComposeFile(res);
    }
    catch(e){
      console.log(e);
      this.addAlert("Unable to create temporary compose file in CWD");
      return;
    }

    this.upProcess = 
      upAll({
        cwd: this.state.cwd, 
        composeOptions: ['--no-ansi', '-f', Constants.paths.TMP_DOCKER_COMPOSE],
        commandOptions,
        stdinArgs: ['y'],
      }, { 
        onStdout: this.handleStdout, 
        onStderr: this.handleStderr,
        onExit: this.handleStartExit,
        onError: (pid, err) => { this.handleError(pid, err); this.resetState(false) }
      });

    this.addActivePid(this.upProcess.pid);

    this.setState({ runningState: RunningState.starting });

    this.expandMonitors();
  }

  handleDown = () => {
    if(this.downProcess)
      return;

    this.downProcess = 
      down({
        cwd: this.state.cwd, 
        composeOptions: ['--no-ansi', '-f', Constants.paths.TMP_DOCKER_COMPOSE],
        commandOptions: ['-v']
      }, { 
        onStdout: this.handleStdout,
        onStderr: this.handleStderr,
        onExit: (pid) => { this.removeFromActivePids(pid); this.downProcess = null }
      });

    this.addActivePid(this.downProcess.pid);
  }

  handleStop = () => {
    this.upProcess.kill('SIGINT');
    if(!this.forceStopping && this.state.runningState !== RunningState.starting){
      const data = "Gracefully stopping... (press Stop again to force)\n";
      this.setState({ output: this.state.output + data });
    }

    this.forceStopping = true;
  }
  
  resetState = (clear = true) => {
    this.setState({
      output: "",
      runningState: RunningState.off,
      runningServicesMap: {},
    });

    // Clears active processes to stop logging
    if(clear)
      this.activeProcessPids = [];

    this.collapseMonitors();
  }

  loadXMLFile(dir, filePath){
    this.setLoading(true);
    fs.readFile(filePath, (err, data) => {
      if (err){
        console.log(err);
        this.addAlert(JSON.stringify(err));
        this.setLoading(false);
        return;
      }

      const doc = mxUtils.parseXml(data);
      const codec = new mxCodec(doc);
      this.state.graph.removeCells(this.state.graph.getChildVertices(this.state.graph.getDefaultParent()));
      codec.decode(doc.documentElement, this.state.graph.getModel());
      
      // Set working directory to opened location
      this.setState({ cwd: dir, loadedFileName: null });
      this.setLoading(false);
      this.resetState();
    });
  }

  loadComposeFile(dir, filePath){
    this.setLoading(true);
    fs.readFile(filePath, (err, data) => {
      if (err){
        console.log(err);
        this.addAlert(JSON.stringify(err));
        this.setLoading(false);
        return;
      }

      const rawJson = safeLoad(data);
      const res = this.state.graph.jsonToModel(rawJson);
      if(res.result === 'ERR')
        this.addAlert(res.errMsg);
      else
        // Set working directory to opened location
        this.setState({ cwd: dir, loadedFileName: path.basename(filePath) });
        this.setLoading(false);
        this.resetState();
    });
  }

  openFileDialog(type, handler){

    let options = {
      defaultPath: this.state.cwd,
      properties: ['showHiddenFiles']
    };

    if(type === 'dir')
      options.properties.push('openDirectory');
    else if (type === 'file'){
      options.properties.push('openFile');
      options.filters = {
        name: 'docker-compose',
        extensions: ['yaml', 'yml']
      };
    }

    dialog.showOpenDialog(options)
    .then( res =>{
      handler(res);
    })
    .catch( e => 
      console.log(e)
    )
  }

  handlePreLoad = (action) => {
    if(action === 'load')
      this.action = this.handleLoad;

    if(action === 'import')
      this.action = this.handleImport;

    if(this.state.runningState !== RunningState.off){
      this.openModal("This action will stop current Docker Compose execution. Proceed?");
      return;
    }
    
    this.action();
  }

  checkYmlFile = (filePath) => {
    const fileName = path.basename(filePath);
    const components = fileName.split(".");
    const extension = components[components.length-1];
    if(components.length < 2 || !Constants.paths.VALID_FILE_EXTENSIONS.includes(extension)){
      this.addAlert("Invalid file. Must be a Docker Compose yaml file");
      return false;
    }

    return true;
  }

  handleLoad = () => {
    const handler = (res) => {
      const dir = res.filePaths[0];
      if (dir) {

        this.removeTmpComposeFile();

        const items = fs.readdirSync(dir);
        
        // Check if project folder exists
        if(items.includes(Constants.paths.SECRET_FOLDER)){
          this.loadXMLFile(dir, path.join(dir, Constants.paths.SECRET_FOLDER, Constants.paths.PROJ_NAME));
        }
        // Else try to find a fallback docker-compose.yaml file
        else if(items.includes('docker-compose.yaml')){
          this.loadComposeFile(dir, path.join(dir, 'docker-compose.yaml'));
        }
        else if(items.includes('docker-compose.yml')){
          this.loadComposeFile(dir, path.join(dir, 'docker-compose.yml'));
        }
        else{
          this.setState({cwd: dir});
          this.handleClear();
        }
      }
    };
    
    this.openFileDialog('dir', handler);
  }

  handleImport = () => {
    const handler = (res) => {
      const file = res.filePaths[0];
      if (file) {
        if(!this.checkYmlFile(file))
          return;

        this.removeTmpComposeFile();
        const dirName = path.dirname(file);

        this.loadComposeFile(dirName, file);
      }
    };

    this.openFileDialog('file', handler);
  }

  openSaveDialog = (data) => {
    const anchor = document.createElement('a');
    anchor.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
    anchor.setAttribute('download', this.state.loadedFileName || 'docker-compose.yml');

    anchor.style.display = 'none';
    document.body.appendChild(anchor);

    anchor.click();

    document.body.removeChild(anchor);
  }

  handleSave = () => {
    const encoder = new mxCodec();
    
    encoder.encodeCell = function(cell, node, includeChildren){
      if(mxUtils.isNode(cell.value)){
        delete cell.div;
      }

      mxCodec.prototype.encodeCell.apply(this, arguments);
    }

    const result = encoder.encode(this.state.graph.getModel());
    const xml = mxUtils.getXml(result);

    try{
      fs.mkdirSync(path.join(this.state.cwd, Constants.paths.SECRET_FOLDER), { recursive: true });
      fs.writeFileSync(path.join(this.state.cwd, Constants.paths.SECRET_FOLDER, Constants.paths.PROJ_NAME), xml);
    }
    catch(e){
      console.log(e);
      this.addAlert(JSON.stringify(e));
    }
  }

  handleClear = (e) => {
    this.state.graph.removeCells(this.state.graph.getChildVertices(this.state.graph.getDefaultParent()));
  }

  isValidKey(source) {
    const model = this.getModel();

    let output = "";
    let keys = {};
    for (let key in model.cells) {

      const cell = model.cells[key];
      if (cell.vertex && cell.type) {
        const keyName = cell.getAttribute('name');
        if (keys[keyName])
          keys[keyName].push(cell);
        else
          keys[keyName] = [cell];
        cell.errors.key = "";
        this.updateView(cell);
      }
    }

    for (let k in keys) {
      if (keys[k].length > 1) {
        for (let i = 0; i < keys[k].length; i++) {
          const c = keys[k][i];
          if (c.id === source.id)
            output = "Duplicate key";
          c.errors.key = "Duplicate key";
          this.updateView(c);
        }
      }
    }

    // if(output !== "")
    //   source.errors.key = output;

    return output;
  }

  validateHostPorts = (source, publishedPort) => {
    const model = this.state.graph.getModel();

    let output = "";
    let allocatedPorts = {};
    for (let key in model.cells) {

      const cell = model.cells[key];
      if (cell.vertex && cell.type === 'service') {

        if(!cell.props.ports)
            continue;

        console.log(cell);
        cell.props.ports.forEach( p => {
          if(p.published && typeof parseInt(p.published) === 'number'){
            if(allocatedPorts[p.published])
              allocatedPorts[p.published].push(cell);
            else
              allocatedPorts[p.published] = [cell];
          }
        })
        cell.errors.ports = "";
        this.state.graph.updateView(cell);
      }
    }

    console.log(allocatedPorts);

    for (let k in allocatedPorts) {
      if (allocatedPorts[k].length > 1) {
        for (let i = 0; i < allocatedPorts[k].length; i++) {
          const c = allocatedPorts[k][i];
          if (publishedPort === k && c.id === source.id)
            output = "ports: Duplicate host port(s) exposed";
          c.errors.ports = "ports: Duplicate host port(s) exposed";
          this.state.graph.updateView(c);
        }
      }
    }

    return output;
  }

  modelToJson(version = '3.6', preferShortSyntax = true, stringCommands = true, arrayMapVariables = true) {
    const model = this.getModel();

    let output = {
      version
    };

    for (let key in model.cells) {

      const cell = model.cells[key];

      if (cell.vertex && cell.type) {
        const container = cell.type+'s';
        if (output[container] === undefined)
          output[container] = {};

        output[container][cell.getAttribute('name')] = 
          setNodeProps(cell, preferShortSyntax, stringCommands, arrayMapVariables)
      }
    }

    return output;
  }

  jsonToModel(json) {
    const parent = this.getDefaultParent();
    console.log(json);

    // Pre-validation
    // Check version
    const { version } = json;
    if (version) {
      if (!/^3(\.\d)?$/.test(version))
        return {
          result: 'ERR',
          errMsg: `Unsupported compose version: ${version}. Must be 3.*`
        }
    }

    this.getModel().beginUpdate();
    try {
      this.removeCells(this.getChildVertices(parent));

      const { services, volumes, networks, configs, secrets } = json;
      let servicesMap = {};
      let volumeMap = {};
      let networkMap = {};
      let configsMap = {};
      let secretsMap = {};

      // Add services
      for (let key in services) {
        let serviceProps = JSON.parse(JSON.stringify(services[key] || {}));
        readPorts(serviceProps);
        readBuild(serviceProps);
        readCommandValues(serviceProps, Constants.attributes.services.commands);
        readSingleArrayValues(serviceProps, Constants.attributes.services.singleArrayEntries)
        readUlimits(serviceProps);
        Constants.attributes.services.mapEntries.forEach(e =>
          readKeyValues(serviceProps, getPathVariable(e))
        );
        cleanService(serviceProps);

        const node = this.createNode('service', key, serviceProps, parent, 0, 0, true);
        servicesMap[key] = node;
      }

      // Add volumes
      for (let key in volumes) {
        const volumeProps = volumes[key] || {};
        readExternal(volumeProps);

        const node = this.createNode('volume', key, volumeProps, parent, 0, 0, true);
        volumeMap[key] = node;
      }

      // Add networks
      for (let key in networks) {
        let networkProps = JSON.parse(JSON.stringify(networks[key] || {}));

        readExternal(networkProps);
        Constants.attributes.networks.mapEntries.forEach( e =>
          readKeyValues(networkProps, getPathVariable(e))
        );

        const node = this.createNode('network', key, networkProps, parent, 0, 0, true);
        networkMap[key] = node;
      }

      // Add configs
      for (let key in configs) {
        const configProps = configs[key] || {};

        readExternal(configProps);
        const node = this.createNode('config', key, configProps, parent, 0, 0, true);
        configsMap[key] = node;
      }

      // Add secrets
      for (let key in secrets) {
        const secret = secrets[key] || {};

        readExternal(secret);
        const node = this.createNode('secret', key, secret, parent, 0, 0, true);
        secretsMap[key] = node;
      }

      // Add dependencies
      for (let key in services) {
        const service = services[key];
        const source = servicesMap[key];

        if (service.depends_on) {
          for (let d of service.depends_on) {
            const target = servicesMap[d];

            let e = this.insertEdge(parent, null, '', source.children[0], target);
            this.setEdge(e);
          }
        }

        if (service.links) {
          for (let l of service.links) {
            const linkProps = readLink(l);
            const target = servicesMap[linkProps.target];
            delete linkProps.target;

            let e = this.insertEdge(parent, null, '', source.children[1], target);
            this.setEdge(e, linkProps);
          }
        }

        if (service.volumes) {
          for (let v of service.volumes) {
            const volumeProps = readVolume(v);

            // Check if source is a named volume
            if (volumeProps.source && volumeMap[volumeProps.source]) {
              const target = volumeMap[volumeProps.source];
              delete volumeProps.source;
              let e = this.insertEdge(parent, null, '', source.children[2], target);
              this.setEdge(e, volumeProps);
            }
            else {
              if (!source.props.volumes)
                source.props.volumes = [];

              source.props.volumes.push(volumeProps);
            }
          }
        }

        if (service.networks) {

          if (Array.isArray(service.networks)) {
            service.networks.forEach(n => {
              console.log(n);
              const target = networkMap[n];
              let e = this.insertEdge(parent, null, '', source.children[3], target);
              this.setEdge(e);
            });
          }
          else {
            for (let key in service.networks) {
              const n = service.networks[key];
              const target = networkMap[key];

              let e = this.insertEdge(parent, null, '', source.children[3], target);
              this.setEdge(e, n);
            }
          }
        }

        if (service.configs) {
          for (let c of service.configs) {
            let props = readConfigOrSecret(c);
            const target = configsMap[props.source];
            setConfigMode(props);
            delete props.source;
            let e = this.insertEdge(parent, null, '', source.children[4], target);
            this.setEdge(e, props);
          }
        }

        if (service.secrets) {
          for (let s of service.secrets) {
            let props = readConfigOrSecret(s);
            const target = secretsMap[props.source];
            delete props.source;
            let e = this.insertEdge(parent, null, '', source.children[5], target);
            this.setEdge(e, props);
          }
        }
      }

      let layout = new mxCircleLayout(this);
      layout.disableEdgeStyle = false;

      layout.execute(parent);
    }
    finally {
      // Updates the display
      this.fit();
      this.getModel().endUpdate();
    }

    return {
      result: 'OK'
    }
  }

  createService(name, props, parent, x, y) {
    const doc = mxUtils.createXmlDocument();
    const service = doc.createElement('Service');
    service.setAttribute('name', name || '');

    const v = this.insertVertex(parent, null,
      service, x, y, 250, 327, 'outlineColor=none;fillOpacity=50;verticalAlign=top;align=left');
    v.props = props;
    v.type = "service";

    const portStyle = 'autosize=1;fontSize=12;spacingRight=10;labelPosition=left;align=right;shape=ellipse;'

    const dependsOn = this.insertVertex(v, null, 'depends_on', 1, 0.15, 12, 12,
      portStyle + 'fillColor=gold', true);
    dependsOn.geometry.offset = new mxPoint(-6, -8);

    const links = this.insertVertex(v, null, 'links', 1, 0.22, 12, 12,
      portStyle + 'fillColor=blue', true);
    links.geometry.offset = new mxPoint(-6, -8);

    const volumes = this.insertVertex(v, null, 'volumes', 1, 0.30, 12, 12,
      portStyle + 'fillColor=green', true);
    volumes.geometry.offset = new mxPoint(-6, -8);

    const networks = this.insertVertex(v, null, 'networks', 1, 0.38, 12, 12,
      portStyle + 'fillColor=red', true);
    networks.geometry.offset = new mxPoint(-6, -8);

    const configs = this.insertVertex(v, null, 'configs', 1, 0.46, 12, 12,
      portStyle + 'fillColor=purple', true);
    configs.geometry.offset = new mxPoint(-6, -8);

    const secrets = this.insertVertex(v, null, 'secrets', 1, 0.54, 12, 12,
      portStyle + 'fillColor=#8B4513', true);
    secrets.geometry.offset = new mxPoint(-6, -8);

    return v;
  }

  createVolume(name, props, parent, x, y) {

    const doc = mxUtils.createXmlDocument();
    const volume = doc.createElement('Volume');
    volume.setAttribute('name', name || '');

    const v = this.insertVertex(parent, null,
      volume, x, y, 140, 120, 'outlineColor=none;fillOpacity=50;verticalAlign=top;align=left;fillColor=green');
    v.props = props;
    v.type = "volume";

    return v;
  }

  createNetwork(name, props, parent, x, y) {
    const doc = mxUtils.createXmlDocument();
    const network = doc.createElement('Network');
    network.setAttribute('name', name || '');

    const v = this.insertVertex(parent, null,
      network, x, y, 140, 120, 'outlineColor=none;fillOpacity=50;verticalAlign=top;align=left;fillColor=red');
    v.props = props;
    v.type = "network";

    return v;
  }

  createConfig(name, props, parent, x, y) {
    const doc = mxUtils.createXmlDocument();
    const config = doc.createElement('Config');
    config.setAttribute('name', name || '');

    const v = this.insertVertex(parent, null,
      config, x, y, 120, 70, 'outlineColor=none;fillOpacity=50;verticalAlign=top;align=left;fillColor=purple');
    v.props = props;
    v.type = "config";

    return v;
  }

  createSecret(name, props, parent, x, y) {
    const doc = mxUtils.createXmlDocument();
    const secret = doc.createElement('Secret');
    secret.setAttribute('name', name || '');

    const v = this.insertVertex(parent, null,
      secret, x, y, 120, 70, 'outlineColor=none;fillOpacity=50;verticalAlign=top;align=left;fillColor=#8B4513');
    v.props = props;
    v.type = "secret";

    return v;
  }

  setEdge(edge, props = {}) {
    edge.type = edge.source.value;
    edge.props = props;
    if (edge.type === "volumes")
      edge.props.type = 'volume';

    const style = this.getCellStyle(edge);
    const sourceStyle = this.getCellStyle(edge.source);
    const newStyle = this.stylesheet.getCellStyle(`edgeStyle=orthogonalEdgeStyle;html=1;rounded=1;jettySize=auto;orthogonalLoop=1;strokeColor=${sourceStyle.fillColor};strokeWidth=4;`, style); //Method will merge styles into a new style object.  We must translate to string from here
    let array = [];
    for (let prop in newStyle)
      array.push(prop + "=" + newStyle[prop]);
    edge.style = array.join(';');
    //Send to back
    this.orderCells(true, [edge]);
  }

  createNode(type, name, props, parent, x, y, resize = false) {
    let node;
    switch (type) {
      case 'service':
        node = this.createService(name, props, parent, x, y);
        break;
      case 'volume':
        node = this.createVolume(name, props, parent, x, y);
        break;
      case 'network':
        node = this.createNetwork(name, props, parent, x, y);
        break;
      case 'config':
        node = this.createConfig(name, props, parent, x, y);
        break;
      case 'secret':
        node = this.createSecret(name, props, parent, x, y);
        break;
      default:
        node = undefined;
    }

    node.errors = {
      key: "",
      others: ""
    };

    node.tags = [];
    node.container = {
      // Either off || running
      status: "off",
      logs: ""
    }

    node.update = true;

    if(resize)
      this.updateCellSize(node, true);

    return node;
  }

  genAutoKey(type){
    const prefix = type.substring(0,3);
    let setIds = [];

    let elems = null;

    const pattern = new RegExp(`${prefix}(\\d+)`);
    const model = this.getModel();
    for (let key in model.cells) {
      const cell = model.cells[key];
      if (cell.vertex && cell.type === type){
        if((elems = cell.getAttribute('name').match(pattern)) != null){
          setIds.push(parseInt(elems[1]));
        }
      }
    }

    setIds.sort((a,b) => a-b);

    // Find lowest avaible id
    let availableId = 1;
    let i = 0;
    for(i; i<setIds.length;i++)
    {
      if(setIds[i] > availableId)
        break;
      else
        availableId++;
    }
   
    return prefix+availableId;
  }

  addNode(type, name, props, parent, x, y) {
    let node = undefined;
    this.getModel().beginUpdate();
    try {
      name = this.genAutoKey(type);
      node = this.createNode(type, name, props, parent, x, y);
    }
    finally {
      this.getModel().endUpdate();
    }

    return node;
  }

  updateView(cell, resize = false) {
    if (!cell)
      cell = this.getSelectionCell();
    cell.update = true;

    this.getModel().beginUpdate();
    try {
      const edit = new mxCellAttributeChange(
        cell, 'name',
        cell.getAttribute('name'));
      this.getModel().execute(edit);
    }
    finally {
      this.getModel().endUpdate();
    }

    // console.log("updating view...");
    if(resize)
      this.updateCellSize(cell, true);
  }

  isPort(cell) {
    const geo = this.state.graph.getCellGeometry(cell);

    return (geo != null) ? geo.relative : false;
  }

  LoadGraph = () => {
    const container = this.divGraph.current;

    // Checks if the browser is supported
    if (!mxClient.isBrowserSupported()) {
      // Displays an error message if the browser is not supported.
      mxUtils.error("Browser is not supported!", 200, false);
    } else {

      // Adds optional caching for the HTML label
      let cached = true;

      mxEvent.disableContextMenu(document.body);

      mxConstants.DEFAULT_VALID_COLOR = '#409EFF';
      mxConstants.HIGHLIGHT_OPACITY = 50;
      mxConstants.HANDLE_FILLCOLOR = '#99ccff';
      mxConstants.HANDLE_STROKECOLOR = '#0088cf';
      mxConstants.VERTEX_SELECTION_COLOR = '#00a8ff';
      mxConstants.DEFAULT_HOTSPOT = 1;

      // Creates the graph inside the given container
      let graph = new mxGraph(container);
      this.setState({ graph: graph });

      // Create grid dynamically (requires canvas)
      try {
        let canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0px';
        canvas.style.left = '0px';
        canvas.style.zIndex = -1;
        canvas.classList.add("fill");
        graph.container.appendChild(canvas);

        let ctx = canvas.getContext('2d');

        // Modify event filtering to accept canvas as container
        let mxGraphViewIsContainerEvent = mxGraphView.prototype.isContainerEvent;
        mxGraphView.prototype.isContainerEvent = function(evt) {
          return mxGraphViewIsContainerEvent.apply(this, arguments) ||
            mxEvent.getSource(evt) === canvas;
        };

        let s = 0;
        let gs = 0;
        let tr = new mxPoint();
        let w = 0;
        let h = 0;

        function repaintGrid() {
          if (ctx != null) {
            let bounds = graph.getGraphBounds();
            let width = Math.max(bounds.x + bounds.width, graph.container.clientWidth);
            let height = Math.max(bounds.y + bounds.height, graph.container.clientHeight);
            let sizeChanged = width !== w || height !== h;

            if (graph.view.scale !== s || graph.view.translate.x !== tr.x || graph.view.translate.y !== tr.y ||
              gs !== graph.gridSize || sizeChanged) {
              tr = graph.view.translate.clone();
              s = graph.view.scale;
              gs = graph.gridSize;
              w = width;
              h = height;

              // Clears the background if required
              if (!sizeChanged) {
                ctx.clearRect(0, 0, w, h);
              }
              else {
                canvas.setAttribute('width', w);
                canvas.setAttribute('height', h);
              }

              let tx = tr.x * s;
              let ty = tr.y * s;

              // Sets the distance of the grid lines in pixels
              let minStepping = graph.gridSize;
              let stepping = minStepping * s;

              if (stepping < minStepping) {
                let count = Math.round(Math.ceil(minStepping / stepping) / 2) * 2;
                stepping = count * stepping;
              }

              let xs = Math.floor((0 - tx) / stepping) * stepping + tx;
              let xe = Math.ceil(w / stepping) * stepping;
              let ys = Math.floor((0 - ty) / stepping) * stepping + ty;
              let ye = Math.ceil(h / stepping) * stepping;

              xe += Math.ceil(stepping);
              ye += Math.ceil(stepping);

              let ixs = Math.round(xs);
              let ixe = Math.round(xe);
              let iys = Math.round(ys);
              let iye = Math.round(ye);

              // Draws the actual grid
              ctx.strokeStyle = '#f6f6f6';
              // ctx.strokeStyle = 'lightgrey';
              ctx.beginPath();

              for (let x = xs; x <= xe; x += stepping) {
                x = Math.round((x - tx) / stepping) * stepping + tx;
                let ix = Math.round(x);

                ctx.moveTo(ix + 0.5, iys + 0.5);
                ctx.lineTo(ix + 0.5, iye + 0.5);
              }

              for (let y = ys; y <= ye; y += stepping) {
                y = Math.round((y - ty) / stepping) * stepping + ty;
                let iy = Math.round(y);

                ctx.moveTo(ixs + 0.5, iy + 0.5);
                ctx.lineTo(ixe + 0.5, iy + 0.5);
              }

              ctx.closePath();
              ctx.stroke();
            }
          }
        };

        const mxGraphViewValidateBackground = mxGraphView.prototype.validateBackground;
        mxGraphView.prototype.validateBackground = function() {
          mxGraphViewValidateBackground.apply(this, arguments);
          repaintGrid();
        };
      }
      catch (e) {
        console.log('Using background image');
        container.style.backgroundImage = 'url(\'editors/images/grid.gif\')';
      }

      graph.getView().validateBackground();

      // const parent = graph.getDefaultParent();

      // Enables rubberband selection
      new mxRubberband(graph);

      graph.setPanning(true);
      graph.setTooltips(true);
      graph.setConnectable(true);
      graph.setCellsEditable(false);
      graph.setHtmlLabels(true);
      graph.setEdgeLabelsMovable(false);
      graph.setVertexLabelsMovable(false);
      graph.setGridEnabled(true);
      graph.setAllowDanglingEdges(false);
      graph.setDisconnectOnMove(false);
      graph.setCellsResizable(false);
      graph.setMultigraph(false);

      graph.setEdge = this.setEdge.bind(graph);

      graph.convertValueToString = (cell) => {
        // console.log("convertValueToString");

        if (mxUtils.isNode(cell.value)) {
          let jsx = '';

          if (cell.type === 'service') {
            jsx = <ServiceLabel graph={this.state.graph} cell={cell} runningState={this.state.runningState} />
          }
          else if (cell.type === "volume") {
            jsx = <VolumeLabel cell={cell} />
          }
          else if (cell.type === "network") {
            jsx = <NetworkLabel cell={cell} />
          }
          else if (cell.type === "config") {
            jsx = <ConfigLabel cell={cell} />
          }
          else if (cell.type === "secret") {
            jsx = <SecretLabel cell={cell} />
          }

          // Re-render if chached
          if (cached && cell.div != null) {
            ReactDOM.render(jsx, cell.div);
            return cell.div;
          }

          let div = document.createElement('div');
          div.id = `cell_${cell.id}`;
          ReactDOM.render(jsx, div);

          if (cached) 
            cell.div = div;

          return div;
        }
        else if (cell.vertex) {
          return cell.value.charAt(0).toUpperCase() + cell.value.slice(1);
        }

        return '';
      };

      // Configures automatic expand on mouseover
      graph.popupMenuHandler.autoExpand = true;
      graph.popupMenuHandler.submenuImage = submenuIcon;
      graph.popupMenuHandler.factoryMethod = (menu, cell, evt) => {
        if (cell) {
          if (cell.edge) {
            menu.addItem("Delete connection", null, function() {
              graph.removeCells([cell]);
              mxEvent.consume(evt);
            });
          }
          else if (cell.vertex) {
            menu.addItem("Delete", null, () => {
              graph.removeCells([cell]);
              mxEvent.consume(evt);
            });
          }
        }
        else {
          const graphCoords = graph.getPointForEvent(evt);
          menu.addItem("New service", null, () => {
            graph.addNode('service', "", {}, graph.getDefaultParent(), graphCoords.x, graphCoords.y);
          });
          menu.addItem("New volume", null, () => {
            graph.addNode('volume', "", {}, graph.getDefaultParent(), graphCoords.x, graphCoords.y);
          });
          menu.addItem("New network", null, () => {
            graph.addNode('network', "", {}, graph.getDefaultParent(), graphCoords.x, graphCoords.y);
          });

          let submenu1 = menu.addItem('Others', null, null);
          menu.addItem('New config', null, () => {
            graph.addNode('config', "", {}, graph.getDefaultParent(), graphCoords.x, graphCoords.y);
          }, submenu1);
          menu.addItem('New secret', null, () => {
            graph.addNode('secret', "", {}, graph.getDefaultParent(), graphCoords.x, graphCoords.y);
          }, submenu1);
        }
      };

      graph.getTooltipForCell = (cell) => {
        if(cell.vertex && cell.type){
          const json = setNodeProps(cell);
          return safeDump(json);
        }

        return null;
      };

      const undoManager = new mxUndoManager();
      const listener = function(sender, evt) {
        undoManager.undoableEditHappened(evt.getProperty('edit'));
      };
      graph.getModel().addListener(mxEvent.UNDO, listener);
      graph.getView().addListener(mxEvent.UNDO, listener);

      let keyHandler = new mxKeyHandler(graph);
      keyHandler.getFunction = function(evt) {
        if (evt != null) {
          return (mxEvent.isControlDown(evt) || (mxClient.IS_MAC && evt.metaKey)) ? this.controlKeys[evt.keyCode] : this.normalKeys[evt.keyCode];
        }

        return null;
      };

      keyHandler.bindKey(46, function(evt) {
        if (graph.isEnabled()) {
          const cells = graph.getSelectionCells();
          graph.removeCells(cells);
        }
      });

      keyHandler.bindControlKey(90, (evt) => undoManager.undo());

      keyHandler.bindControlKey(89, (evt) => undoManager.redo());

      keyHandler.bindControlKey(171, (evt) => graph.zoomIn());

      keyHandler.bindControlKey(173, (evt) => graph.zoomOut());

      graph.isPortAlt = (cell) => {
        const geo = this.state.graph.getCellGeometry(cell);

        return (geo != null) ? geo.relative && cell.type !== 'label' : false;
      }

      graph.connectionHandler.addListener(mxEvent.CONNECT, (sender, evt) => {
        let edge = evt.getProperty('cell');
        graph.setEdge(edge);
      });

      let getEdgeValidationError = graph.getEdgeValidationError;
      graph.getEdgeValidationError = (edge, source, target) => {

        // Disallow ports
        if (graph.isPortAlt(target))
          return '';

        // Disallow self
        if (source.parent === target)
          return '';

        // Enforce connections between types
        if (source.value === "depends_on" || source.value === "links") {
          if (target.type !== "service")
            return '';
        }
        else if (source.value === "volumes") {
          if (target.type !== "volume")
            return '';
        }
        else if (source.value === "networks") {
          if (target.type !== "network")
            return '';
        }
        else if (source.value === "configs") {
          if (target.type !== "config")
            return '';
        }
        else if (source.value === "secrets") {
          if (target.type !== "secret")
            return '';
        }

        return getEdgeValidationError.call(graph, edge, source, target);
      }

      graph.isCellSelectable = function(cell) {
        const state = this.view.getState(cell);
        const style = (state != null) ? state.style : this.getCellStyle(cell);

        return this.isCellsSelectable() && !this.isCellLocked(cell) && style['selectable'] !== 0;
      };

      const isValidSource = graph.isValidSource;
      graph.isValidSource = function(cell) {
        return this.isPortAlt(cell) && isValidSource.call(graph, cell);
      };

      graph.isValidTarget = function(cell) {
        return isValidSource.call(graph, cell);
      };

      // Adds mouse wheel handling for zoom
      mxEvent.addMouseWheelListener((evt, up) => {
        if (mxEvent.isControlDown(evt) || (mxClient.IS_MAC && evt.metaKey)) {
          if (up) {
            graph.zoomIn();
          }
          else {
            graph.zoomOut();
          }

          mxEvent.consume(evt);
        }
      });

      graph.cellSizeUpdated = function(cell, ignoreChildren) {
        if (cell != null) {
          this.model.beginUpdate();
          try {
            var size = this.getPreferredSizeForCell(cell);
            var geo = this.model.getGeometry(cell);

            if (size != null && geo != null) {
              var collapsed = this.isCellCollapsed(cell);
              geo = geo.clone();

              if (this.isSwimlane(cell)) {
                var style = this.getCellStyle(cell);
                var cellStyle = this.model.getStyle(cell);

                if (cellStyle == null) {
                  cellStyle = '';
                }

                if (mxUtils.getValue(style, mxConstants.STYLE_HORIZONTAL, true)) {
                  cellStyle = mxUtils.setStyle(cellStyle,
                    mxConstants.STYLE_STARTSIZE, size.height + 8);

                  if (collapsed) {
                    geo.height = size.height + 8;
                  }

                  geo.width = size.width;
                }
                else {
                  cellStyle = mxUtils.setStyle(cellStyle,
                    mxConstants.STYLE_STARTSIZE, size.width + 8);

                  if (collapsed) {
                    geo.width = size.width + 8;
                  }

                  geo.height = size.height;
                }

                this.model.setStyle(cell, cellStyle);
              }
              else {
                var state = this.view.createState(cell);
                var align = (state.style[mxConstants.STYLE_ALIGN] || mxConstants.ALIGN_CENTER);

                if (align === mxConstants.ALIGN_RIGHT) {
                  geo.x += geo.width - size.width;
                }
                else if (align === mxConstants.ALIGN_CENTER) {
                  geo.x += Math.round((geo.width - size.width) / 2);
                }

                var valign = this.getVerticalAlign(state);

                if (valign === mxConstants.ALIGN_BOTTOM) {
                  geo.y += geo.height - size.height;
                }
                else if (valign === mxConstants.ALIGN_MIDDLE) {
                  geo.y += Math.round((geo.height - size.height) / 2);
                }

                // Calc new height based on html label height 
                // const newHeight = cell.div.clientHeight + 20;               

                if(cell.type === 'service'){
                  // Calc new height based on props

                  let newHeight = 327;

                  if(cell.props.ports){
                    cell.props.ports.forEach( p => {
                      const max = Math.max(p.target ? p.target.toString().length : 0, p.published ? p.published.toString().length : 0)
                      newHeight += Math.ceil(max / 9)*14.4+5;
                    });
                    newHeight -= 5;
                  }

                  // const newHeight = 327 + (cell.props.ports ? (14.4 * cell.props.ports.length + 5 * cell.props.ports.length-1) : 0);
                  geo.height = newHeight;

                  // Update port relative position
                  let init = 0.2
                  for (let child of cell.children) {
                    child.geometry.y = (init * 250) / newHeight;
                    // console.log(child.geometry);
                    init += 0.1;
                  }
                }
              }

              if (!ignoreChildren && !collapsed) {
                var bounds = this.view.getBounds(this.model.getChildren(cell));

                if (bounds != null) {
                  var tr = this.view.translate;
                  var scale = this.view.scale;

                  var width = (bounds.x + bounds.width) / scale - geo.x - tr.x;
                  var height = (bounds.y + bounds.height) / scale - geo.y - tr.y;

                  geo.width = Math.max(geo.width, width);
                  geo.height = Math.max(geo.height, height);

                }
              }

              this.cellsResized([cell], [geo], false);
            }
          }
          finally {
            this.model.endUpdate();
          }
        }
      }

      let style = graph.getStylesheet().getDefaultVertexStyle();      
      style[mxConstants.STYLE_FILLCOLOR] = 'lightgrey';
      style[mxConstants.STYLE_FONTCOLOR] = 'black';
      style[mxConstants.STYLE_FONTSIZE] = '10';
      style[mxConstants.STYLE_ROUNDED] = 1;

      style = graph.getStylesheet().getDefaultEdgeStyle();
      style[mxConstants.STYLE_STROKECOLOR] = '#0C0C0C';
      style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'white';
      style[mxConstants.STYLE_EDGE] = mxEdgeStyle.TopToBottom;
      style[mxConstants.STYLE_ROUNDED] = true;
      style[mxConstants.STYLE_FONTCOLOR] = 'black';
      style[mxConstants.STYLE_FONTSIZE] = '10';

      graph.createNode = this.createNode;
      graph.createService = this.createService;
      graph.createVolume = this.createVolume;
      graph.createNetwork = this.createNetwork;
      graph.createConfig = this.createConfig;
      graph.createSecret = this.createSecret;
      graph.addNode = this.addNode;


      let selectionChanged = (sender, evt) => {
        // Forces focusout in IE
        graph.container.focus();

        // Gets the selection cell
        const selectedCell = graph.getSelectionCell();

        if (selectedCell == null) {
          this.setState({ display: "none" });
        }
        else {
          if (selectedCell.type !== undefined)
            this.setState({ display: selectedCell.type });
        }
      }

      mxObjectCodec.prototype.convertAttributeToXml = function(enc, obj, name, value)
      {
        // Makes sure to encode boolean values as numeric values
        


        // if (this.isBooleanAttribute(enc, obj, name, value))
        if (typeof value === 'boolean')
        {  
          // Checks if the value is true (do not use the value as is, because
          // this would check if the value is not null, so 0 would be true)
            value = (value === true) ? 'true' : 'false';
        }
        
        return value;
      };


      mxObjectCodec.prototype.convertAttributeFromXml = function(dec, attr, obj)
      {
        var value = attr.value;
        if(attr.name === 'stdin_open')
          console.log(attr);
        
        if (this.isNumericAttribute(dec, attr, obj))
        {
          if(attr.name === 'stdin_open')
            console.log("numeric");
          value = parseFloat(value);
          
          if (isNaN(value) || !isFinite(value))
          {
            value = 0;
          }
        }
        
        return value;
      };

      graph.getSelectionModel().addListener(mxEvent.CHANGE, selectionChanged.bind(this));

      graph.modelToJson = this.modelToJson;
      graph.jsonToModel = this.jsonToModel;
      graph.updateView = this.updateView;
      graph.isValidKey = this.isValidKey;
      graph.genAutoKey = this.genAutoKey;
      graph.validateHostPorts = this.validateHostPorts.bind(graph);

      this.setState({ isReady: true });
    }
  }

  render() {
    const main = 
      <React.Fragment>
          <SplitPane split="vertical" minSize={window.innerWidth-400} size={window.innerWidth-320} style={{position: "static"}}>
            <div className="fill d-flex">
              <div ref={this.sidebarContainer} id="sidebar-container">
                <SideBar output={this.state.output} isReady={this.state.isReady} makeDraggable={this.makeDraggable} graph={this.state.graph} />
              </div>
              <div id="graph-editor">
                <div id="graph-toolbar">
                  <div className="fill container p-0 m-0">
                    <div className="row">
                      <div className="col-9">
                        <button ref={this.sidebarToggle} onClick={this.toggleSidebar} className="btn btn-sm btn-light bg-white" type="button">{ this.state.sidebarHidden ? <FontAwesomeIcon icon={faCaretRight}/> : <FontAwesomeIcon icon={faCaretLeft}/>}</button>
                        <button onClick={this.handleClear} className="btn btn-sm btn-light bg-white ml-2" type="button"><span style={{ color: 'red' }}><FontAwesomeIcon icon={faTrash}/></span></button>
                      </div>
                      <div className="col-3 d-flex justify-content-end">
                        <button onClick={() => this.state.graph.zoomIn()} className="btn btn-sm btn-light bg-white mr-1"><FontAwesomeIcon icon={faSearchPlus}/></button>
                        <button onClick={() => this.state.graph.zoomOut()} className="btn btn-sm btn-light bg-white mr-1"><FontAwesomeIcon icon={faSearchMinus}/></button>
                        <button onClick={() => this.state.graph.fit()} className="btn btn-sm btn-light bg-white mr-1"><FontAwesomeIcon icon={faCompressArrowsAlt}/></button>
                      </div>
                    </div>
                  </div>
                </div>
                <div id="graph-container">
                  <div ref={this.divGraph} id="graph" className="fill"/>
                  <div className="position-absolute d-flex fill flex-column justify-content-center align-items-center" style={{ top: '0px', visibility: this.state.loading ? 'visible' : 'hidden' }}>
                    <div className="my-2 spinner-border text-primary"></div>
                  </div>;
                </div>
              </div>
            </div>
            <PropertiesSelector graph={this.state.graph} display={this.state.display} />
          </SplitPane>
      </React.Fragment>

    return (
      <React.Fragment>
        <SplitPane split="horizontal" minSize={window.innerHeight-this.monitorsDimensions.max} size={this.state.mainPanelSize}>
          <div className="fill">
            <div style={{ height: '50px' }}/>
            <div style={{ height: "calc(100% - 50px)", display: "flex" }}>
              { main }
            </div>
          </div>
          <div className="position-relative" style={{ borderTop: '1px solid lightgrey' }}>
            <Monitors output={this.state.output} runningServicesMap={this.state.runningServicesMap}/>
            <button onClick={this.collapseMonitors} className="position-absolute btn btn-light btn-sm" style={{ top: '0px', right: '0px'}} >
              <FontAwesomeIcon icon={faTimes}/>
            </button>
          </div>
        </SplitPane>
        <ToolBar graph={this.state.graph} cwd={this.state.cwd} updateCwd={this.updateCwd} runningState={this.state.runningState} tmpFileCreated={this.tmpFileCreated} onStart={this.handleStart} onStop={this.handleStop} onDown={this.handleDown} onSave={this.handleSave} onLoad={() => this.handlePreLoad('load')} onImport={() => this.handlePreLoad('import')} openSaveDialog={this.openSaveDialog}/>
        <div id="alerts">
          {
            this.state.alerts.map((a, i) => {
              return (
                <Alert key={i} variant="danger">
                  {a}
                </Alert>
              )
            })
          }
        </div>
        <Modal show={this.state.modalShow} onHide={this.handleHide} centered>
          <Modal.Header closeButton>
            <Modal.Title>Warning</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div>{this.state.modalMsg}</div>
          </Modal.Body>
          <Modal.Footer>
            <button className="btn btn-secondary" onClick={this.handleHide}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={this.handleConfirm}>
              Confirm
            </button>
          </Modal.Footer>
        </Modal>
      </React.Fragment>
    );
  }
}