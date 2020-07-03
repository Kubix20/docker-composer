import React from "react";
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Properties from './properties';
import CollapsibleMenu from './collapsibleMenu';
import MultipleProperties from './multipleProperties';
import InfoLabel from './infoLabel';
import PortEntry from './entries/portEntry';
import MapEntry from './entries/mapEntry';
import DeployPlacementPreferencesEntry from './entries/deployPlacementPreferencesEntry';
import SimpleEntry from './entries/simpleEntry';
import VolumeEntry from './entries/volumeEntry';
import Constants from '../../constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { leafSelect, setVariable } from '../../utils';
const { shell } = require('electron');


export default class ServiceProperties extends Properties {

  constructor(props) {
    super(props);

    this.imageInput = React.createRef();
    this.tagInput = React.createRef();
  }

  initializeState() {
    const state = {
      key: this.selectedCell.getAttribute('name'),
      container_name: this.selectedCell.props.container_name || '',
      image: this.selectedCell.props.image ? this.selectedCell.props.image.split(':')[0] || '' : '',
      tag: this.selectedCell.props.image ? this.selectedCell.props.image.split(':')[1] || '' : '',
      command: this.selectedCell.props.command || '',
      entrypoint: this.selectedCell.props.entrypoint || '',
      ports: this.setPorts(this.selectedCell.props.ports) || [],
      volumes: this.setVolumes(this.selectedCell.props.volumes) || [],
      environment: this.selectedCell.props.environment || [],
      restart: this.selectedCell.props.restart || 'no',
      labels: this.selectedCell.props.labels || [],
      init: this.selectedCell.props.init || false,
      user: this.selectedCell.props.user || '',
      working_dir: this.selectedCell.props.working_dir || '',
      domainname: this.selectedCell.props.domainname || '',
      hostname: this.selectedCell.props.hostname || '',
      ipc: this.selectedCell.props.ipc || '',
      mac_address: this.selectedCell.props.mac_address || '',
      priviledged: this.selectedCell.props.priviledged || false,
      read_only: this.selectedCell.props.read_only || false,
      shm_size: this.selectedCell.props.shm_size || '',
      stdin_open: this.selectedCell.props.stdin_open || false,
      tty: this.selectedCell.props.read_only || false,
      cap_add: this.selectedCell.props.cap_add || [],
      cap_drop: this.selectedCell.props.cap_drop || [],
      cgroup_parent: this.selectedCell.props.cgroup_parent || '',
      devices: this.selectedCell.props.devices || [],
      dns: this.selectedCell.props.dns || [],
      dns_search: this.selectedCell.props.dns_search || [],
      env_file: this.selectedCell.props.env_file || [],
      expose: this.selectedCell.props.expose || [],
      external_links: this.selectedCell.props.external_links || [],
      extra_hosts: this.selectedCell.props.extra_hosts || [],
      healthcheckDisable: leafSelect(this.selectedCell.props, 'healthcheck.disable') || false,
      healthcheckTest: leafSelect(this.selectedCell.props, 'healthcheck.test') || '',
      healthcheckRetries: leafSelect(this.selectedCell.props, 'healthcheck.retries') || '3',
      healthcheckTimeout: leafSelect(this.selectedCell.props, 'healthcheck.timeout') || '',
      healthcheckInterval: leafSelect(this.selectedCell.props, 'healthcheck.interval') || '',
      healthcheckStart_period: leafSelect(this.selectedCell.props, 'healthcheck.start_period') || '0s',
      loggingDriver: leafSelect(this.selectedCell.props, 'logging.driver') || 'json-file',
      loggingOptions: leafSelect(this.selectedCell.props, 'logging.options') || [],
      network_mode: this.selectedCell.props.network_mode || '',
      pid: this.selectedCell.props.pid || '',
      security_opt: this.selectedCell.props.security_opt || [],
      stop_grace_period: this.selectedCell.props.stop_grace_period || '',
      stop_signal: this.selectedCell.props.stop_signal || '',
      sysctls: this.selectedCell.props.sysctls || [],
      tmpfs: this.selectedCell.props.tmpfs || [],
      userns_mode: this.selectedCell.props.userns_mode || '(default)',
      credential_specFile: leafSelect(this.selectedCell.props, 'credential_spec.file') || '',
      credential_specRegistry: leafSelect(this.selectedCell.props, 'credential_spec.registry') || '',
      credential_specConfig: leafSelect(this.selectedCell.props, 'credential_spec.config') || '',
      isolation: this.selectedCell.props.isolation || 'default',
      buildContext: leafSelect(this.selectedCell.props, 'build.context') || '',
      buildDockerfile: leafSelect(this.selectedCell.props, 'build.dockerfile') || '',
      buildArgs: leafSelect(this.selectedCell.props, 'build.args') || [],
      buildCache_from: leafSelect(this.selectedCell.props, 'build.cache_from') || [],
      buildNetwork: leafSelect(this.selectedCell.props, 'build.network') || '',
      buildLabels: leafSelect(this.selectedCell.props, 'build.labels') || [],
      buildShm_size: leafSelect(this.selectedCell.props, 'build.shm_size') || '',
      buildTarget: leafSelect(this.selectedCell.props, 'build.target') || '',
      deployEndpoint_mode: leafSelect(this.selectedCell.props, 'deploy.endpoint_mode') || 'vip',
      deployLabels: leafSelect(this.selectedCell.props, 'deploy.labels') || [],
      deployMode: leafSelect(this.selectedCell.props, 'deploy.mode') || 'replicated',
      deployPlacementConstraints: leafSelect(this.selectedCell.props, 'deploy.placement.constraints') || [],
      deployPlacementPreferences: leafSelect(this.selectedCell.props, 'deploy.placement.preferences') || [],
      deployReplicas: leafSelect(this.selectedCell.props, 'deploy.replicas') || '1',
      deployMax_replicas_per_node: leafSelect(this.selectedCell.props, 'deploy.replicas') || '',
      deployResourcesLimitsCpus: leafSelect(this.selectedCell.props, 'deploy.resources.limits.cpus') || '',
      deployResourcesLimitsMemory: leafSelect(this.selectedCell.props, 'deploy.resources.limits.memory') || '',
      deployResourcesReservationsCpus: leafSelect(this.selectedCell.props, 'deploy.resources.reservations.cpus') || '',
      deployResourcesReservationsMemory: leafSelect(this.selectedCell.props, 'deploy.resources.reservations.memory') || '',
      deployRestart_policyCondition: leafSelect(this.selectedCell.props, 'deploy.restart_policy.condition') || 'any',
      deployRestart_policyDelay: leafSelect(this.selectedCell.props, 'deploy.restart_policy.delay') || '0s',
      deployRestart_policyMax_attempts: leafSelect(this.selectedCell.props, 'deploy.restart_policy.max_attempts') || '',
      deployRestart_policyWindow: leafSelect(this.selectedCell.props, 'deploy.restart_policy.window') || '0s',
      deployRollback_configParallelism: leafSelect(this.selectedCell.props, 'deploy.rollback_config.parallelism') || '0',
      deployRollback_configDelay: leafSelect(this.selectedCell.props, 'deploy.rollback_config.delay') || '0s',
      deployRollback_configFailure_action: leafSelect(this.selectedCell.props, 'deploy.rollback_config.failure_action') || 'pause',
      deployRollback_configMonitor: leafSelect(this.selectedCell.props, 'deploy.rollback_config.monitor') || '0s',
      deployRollback_configMax_failure_ratio: leafSelect(this.selectedCell.props, 'deploy.rollback_config.max_failure_ratio') || '0',
      deployRollback_configOrder: leafSelect(this.selectedCell.props, 'deploy.rollback_config.order') || 'stop-first',
      deployUpdate_configParallelism: leafSelect(this.selectedCell.props, 'deploy.update_config.parallelism') || '0',
      deployUpdate_configDelay: leafSelect(this.selectedCell.props, 'deploy.update_config.delay') || '0s',
      deployUpdate_configFailure_action: leafSelect(this.selectedCell.props, 'deploy.update_config.failure_action') || 'pause',
      deployUpdate_configMonitor: leafSelect(this.selectedCell.props, 'deploy.update_config.monitor') || '0s',
      deployUpdate_configMax_failure_ratio: leafSelect(this.selectedCell.props, 'deploy.update_config.max_failure_ratio') || '0',
      deployUpdate_configOrder: leafSelect(this.selectedCell.props, 'deploy.update_config.order') || 'stop-first',
      ulimitsNprocSoft: leafSelect(this.selectedCell.props, 'ulimits.nproc.soft') || '',
      ulimitsNprocHard: leafSelect(this.selectedCell.props, 'ulimits.nproc.hard') || '',
      ulimitsNofileSoft: leafSelect(this.selectedCell.props, 'ulimits.nofile.soft') || '',
      ulimitsNofileHard: leafSelect(this.selectedCell.props, 'ulimits.nofile.hard') || '',
      // selected: [],
      // loadingTags: false,
    };

    Constants.attributes.services.mapEntries.forEach(e =>
      state[e] = this.setMap(state[e])
    )

    return state;
  }

  setPorts(array) {
    if (!array)
      return undefined;

    return array.map(o => {
      if (o)
        return {
          target: o.target || '',
          published: o.published || '',
          protocol: o.protocol || 'TCP',
          mode: o.mode || 'host'
        };
      else
        return { target: '', published: '', protocol: 'TCP', mode: 'host' };
    });
  }

  setVolumes(array) {
    if (!array)
      return undefined;

    return array.map(o => {
      if (o)
        return {
          type: o.type || 'volume',
          source: o.source || '',
          target: o.target || '',
          consistency: o.consistency || 'consistent',
          read_only: o.read_only || false,
          bindPropagation: leafSelect(o, 'bind.propagation') || 'rprivate',
          tmpfsSize: leafSelect(o, 'tmpfs.size') || '',
          volumeNo_copy: leafSelect(o, 'volume.no_copy') || false
        };
      else
        return {
          type: 'volume',
          source: '',
          target: '',
          consistency: 'consistent',
          read_only: false,
          bindPropagation: 'rprivate',
          tmpfsSize: '',
          volumeNo_copy: false
        };
    });
  }

  openDockerHubImage = () => {
    let url = Constants.DOCKERHUB;
    if(this.state.image.includes('/'))
      url += `r/${this.state.image}`;
    else
      url += `_/${this.state.image}`;

    shell.openExternal(url);
  }

  validateHostPorts = (e) => {
    e.target.setCustomValidity(this.props.graph.validateHostPorts(this.selectedCell, e.target.value));
  }

  handlePortDisabledChange = (port, statePort, disabled) => {
    
    if(disabled){
      if(disabled.publishedDisabled){
        setVariable(port, 'published', '');
        statePort.published = '';
      }
    }

    // Update and resize cell
    this.props.graph.updateView(this.selectedCell, true);
  }

  handleVolumeDisabledChange = (volume, stateVolume, disabled) => {

    if(disabled){
      if(disabled.sourceDisabled){
        setVariable(volume, 'source', '');
        stateVolume.source = '';
      }

      if(disabled.volumeNo_copyDisabled){
        setVariable(volume, 'volume.no_copy', false);
        stateVolume.volumeNo_copy = false;
      }

      if(disabled.bindPropagationDisabled){
        setVariable(volume, 'bind.propagation', 'rprivate', 'rprivate');
        stateVolume.bindPropagation = 'rprivate';
      }

      if(disabled.tmpfsSize){
        setVariable(volume, 'tmpfs.size', '');
        stateVolume.tmpfsSize = '';
      }
    }
  }

  handleImageChange = (e) => {
    const imageInput = this.imageInput.current;
    const tagInput = this.tagInput.current;
    let image = '';

    if (tagInput.value !== "")
      image = `${imageInput.value}:${tagInput.value}`;
    else
      image = imageInput.value;
    this.setState({ image: imageInput.value, tag: tagInput.value });
    setVariable(this.selectedCell.props, 'image', image);
    this.props.graph.updateView();
  }

  canAdd = (variable, last) => {
    if (variable === 'ports')
      return (last.target !== '' || last.published !== '');
    else if (variable === 'environment' || variable === 'label')
      return (last.key !== '')

    return true;
  }

  addEntry = (variable) => {
    if (variable === 'ports')
      this.setState({ ports: [...this.state.ports, { target: '', published: '', protocol: 'TCP', mode: 'host' }] });
    else if (variable === 'volumes')
      this.setState({ volumes: [...this.state.volumes, { type: 'volume', source: '', target: '', read_only: false, bindPropagation: 'rprivate', tmpfsSize: '', volumeNo_copy: false }] });
    else if(variable === 'deployPlacementPreferences')
      this.setState({ deployPlacementPreferences: [...this.state.deployPlacementPreferences, { spread: '' }] });
    else if (Constants.attributes.services.singleEntries.indexOf(variable) >= 0)
      this.setState({ [variable]: [...this.state[variable], ''] });
    else if (Constants.attributes.services.mapEntries.indexOf(variable) >= 0)
      this.setState({ [variable]: [...this.state[variable], { key: '', value: '' }] });
  }

  render() {
    return (
      <div id="props_ser" className="properties overflow-auto">
        <div className="m-2">
          <form ref={this.form}>
            <Tabs defaultActiveKey="basic" id="uncontrolled-tab-example">
              <Tab eventKey="basic" title="Basic">
                <div className="form-group my-1">
                  <label htmlFor="ser_key">Key</label>
                  <input type="text" value={this.state.key} ref={this.keyInput} onChange={this.handleKeyChange} onBlur={() => {this.validateKey(); this.validateForm()}} className="form-control form-control-sm" id="ser-key" autoComplete="off" placeholder="e.g. web" required></input>
                </div>
                <div className="form-group my-1">
                  <InfoLabel htmlFor="ser_name" docsId="container_name">Name</InfoLabel>
                  <input type="text" value={this.state.container_name} onChange={this.handleVariableChange} className="form-control form-control-sm" id="ser-container_name" autoComplete="off"></input>
                </div>
                <div className="form-row mt-1">
                  <div className="form-group col-8">
                    <div className="d-flex justify-content-between align-items-center">
                      <label htmlFor="image">Image</label>
                      <span className="pointer ml-1" onClick={this.openDockerHubImage} style={{ fontSize: '10px'}} title="Open on Docker Hub"><FontAwesomeIcon icon={faExternalLinkAlt}/></span>
                    </div>
                    <input type="text" ref={this.imageInput} value={this.state.image} onChange={this.handleImageChange} className="form-control form-control-sm" id="ser-image" autoComplete="off" placeholder="e.g. node"></input>
                  </div>
                  <div className="form-group col-4">
                    <label htmlFor="tag">Tag</label>
                    <input type="text" ref={this.tagInput} value={this.state.tag} onChange={this.handleImageChange} className="form-control form-control-sm" id="ser-tag" autoComplete="off" placeholder="latest"></input>
                  </div>
                </div>
                <CollapsibleMenu className="mt-0" label="Build">
                  <div className="form-group my-1">
                    <label htmlFor="ser-build.context">Context</label>
                    <input type="text" value={this.state.buildContext} onChange={this.handleVariableChange} className="form-control form-control-sm" id="ser-build.context" autoComplete="off" placeholder=""></input>
                  </div>
                  <div className="form-group my-1">
                    <label htmlFor="ser-build.dockerfile">Dockerfile</label>
                    <input type="text" value={this.state.buildDockerfile} onChange={this.handleVariableChange} className="form-control form-control-sm" id="ser-build.dockerfile" autoComplete="off" placeholder=""></input>
                  </div>
                  <MultipleProperties id="build.args" label="Arguments" onAdd={this.handleAdd}>
                    {
                      this.state.buildArgs.map((arg, i) => (
                        <MapEntry key={i} label="build.args" object={arg} index={i} onChange={this.handlePropsChanged} onRemove={this.handleRemove}></MapEntry>
                      ))
                    }
                  </MultipleProperties>
                  <div className="form-group my-1">
                    <label htmlFor="ser-build.target">Target</label>
                    <input type="text" value={this.state.buildTarget} onChange={this.handleVariableChange} className="form-control form-control-sm" id="ser-build.target" autoComplete="off" placeholder=""></input>
                  </div>
                  <div className="form-group my-1">
                    <label htmlFor="ser-build.network">Network</label>
                    <input type="text" value={this.state.buildNetwork} onChange={this.handleVariableChange} className="form-control form-control-sm" id="ser-build.network" autoComplete="off" placeholder=""></input>
                  </div>
                  <div className="form-group my-1">
                    <label htmlFor="ser-build.shm_size">Shm size</label>
                    <input type="text" value={this.state.buildShm_size} onChange={this.handleVariableChange} onBlur={this.validateForm} className="form-control form-control-sm" id="ser-build.shm_size" autoComplete="off" placeholder="" pattern={Constants.patterns.SIZE}></input>
                  </div>
                  <MultipleProperties id="build.cache_from" label="Cache from" onAdd={this.handleAdd}>
                    {
                      this.state.buildCache_from.map((option, i) => (
                        <SimpleEntry key={i} label="build.cache_from" entry={option} index={i} pattern={Constants.patterns.IMAGE} onChange={this.handlePropsChanged} onRemove={this.handleRemove} onBlur={this.validateForm}/>
                      ))
                    }
                  </MultipleProperties>
                  <MultipleProperties id="build.labels" label="Labels" onAdd={this.handleAdd}>
                    {
                      this.state.buildLabels.map((label, i) => (
                        <MapEntry key={i} label="build.labels" object={label} index={i} onChange={this.handlePropsChanged} onRemove={this.handleRemove}/>
                      ))
                    }
                  </MultipleProperties>
                </CollapsibleMenu>
                <div className="form-group my-1">
                  <label htmlFor="ser_command">Command</label>
                  <textarea rows="2" value={this.state.command} onChange={this.handleVariableChange} className="form-control form-control-sm" id="ser-command" placeholder="Override command"></textarea>
                </div>
                <div className="form-group my-1">
                  <label htmlFor="ser_entrypoint">Entrypoint</label>
                  <textarea rows="2" value={this.state.entrypoint} onChange={this.handleVariableChange} className="form-control form-control-sm" id="ser-entrypoint" placeholder="Override command"></textarea>
                </div>
                <MultipleProperties id="ports" label="Ports" onAdd={this.handleAdd}>
                  {
                    this.state.ports.map((port, i) => (
                      <PortEntry key={i} port={port} index={i} onChange={this.handlePropsChanged} onDisabledChange={this.handlePortDisabledChange} onPublishedPortBlur={this.validateHostPorts} onRemove={this.handleRemove}></PortEntry>
                    ))
                  }
                </MultipleProperties>
                <MultipleProperties id="volumes" label="Volumes" onAdd={this.handleAdd}>
                  {
                    this.state.volumes.map((v, i) => (
                      <VolumeEntry key={i} label="volumes" object={v} index={i} onChange={this.handlePropsChanged} onDisabledChange={this.handleVolumeDisabledChange} onRemove={this.handleRemove}></VolumeEntry>
                    ))
                  }
                </MultipleProperties>
                <MultipleProperties id="environment" label="Environment" onAdd={this.handleAdd}>
                  {
                    this.state.environment.map((env, i) => (
                      <MapEntry key={i} label="environment" object={env} index={i} onChange={this.handlePropsChanged} onRemove={this.handleRemove}></MapEntry>
                    ))
                  }
                </MultipleProperties>
                <MultipleProperties id="env_file" label="Environment files" onAdd={this.handleAdd}>
                  {
                    this.state.env_file.map((entry, i) => (
                      <SimpleEntry key={i} label="env_file" entry={entry} index={i} onChange={this.handlePropsChanged} onRemove={this.handleRemove}></SimpleEntry>
                    ))
                  }
                </MultipleProperties>
                <div className="form-group my-2">
                  <label htmlFor="ser-restart">Restart policy</label>
                  <select value={this.state.restart} onChange={this.handleVariableChange} defaultoption="no" id="ser-restart" className="form-control form-control-sm">
                    <option>no</option>
                    <option>always</option>
                    <option>on-failure</option>
                    <option>unless-stopped</option>
                  </select>
                </div>
                <MultipleProperties id="labels" label="Labels" onAdd={this.handleAdd}>
                  {
                    this.state.labels.map((label, i) => (
                      <MapEntry key={i} label="labels" object={label} index={i} onChange={this.handlePropsChanged} onRemove={this.handleRemove}></MapEntry>
                    ))
                  }
                </MultipleProperties>
              </Tab>
              <Tab eventKey="advanced" title="Advanced">
                <div className="form-check my-1">
                  <input className="form-check-input" type="checkbox" checked={this.state.init} onChange={this.handleCheckChange} id="ser-init"></input>
                  <label className="form-check-label" htmlFor="ser-init">Init</label>
                </div>
                <div className="form-group my-1">
                  <label htmlFor="ser-pid">Pid</label>
                  <input type="text" value={this.state.pid} onChange={this.handleVariableChange} onBlur={this.validateForm} className="form-control form-control-sm" id="ser-pid" pattern={Constants.patterns.PID} autoComplete="off" placeholder=""></input>
                </div>
                <div className="form-group my-1">
                  <label htmlFor="ser-cgroup_parent">Cgroup parent</label>
                  <input type="text" value={this.state.cgroup_parent} onChange={this.handleVariableChange} className="form-control form-control-sm" id="ser-cgroup_parent" autoComplete="off" placeholder=""></input>
                </div>
                <CollapsibleMenu className="mt-2" label="Healthcheck">
                  <div className="form-check my-1">
                    <input className="form-check-input" type="checkbox" checked={this.state.healthcheckDisable} onChange={this.handleCheckChange} id="ser-healthcheck.disable"></input>
                    <label className="form-check-label" htmlFor="ser-init">Disable</label>
                  </div>
                  <div className="form-group my-1">
                    <label htmlFor="ser-healthcheck.test">Test command</label>
                    <input type="text" value={this.state.healthcheckTest} onChange={this.handleVariableChange} className="form-control form-control-sm" id="ser-healthcheck.test" autoComplete="off" placeholder=""></input>
                  </div>
                  <div className="form-row">
                    <div className="form-group col">
                      <label htmlFor="ser-healthcheck.retries">Retries</label>
                      <input type="number" min="0" value={this.state.healthcheckRetries} onChange={this.handleVariableChange} className="form-control form-control-sm" id="ser-healthcheck.retries" defaultoption="3" autoComplete="off" placeholder=""></input>
                    </div>
                    <div className="form-group col">
                      <label htmlFor="ser-healthcheck.timeout">Timeout</label>
                      <input type="text" value={this.state.healthcheckTimeout} onChange={this.handleVariableChange} onBlur={this.validateForm} className="form-control form-control-sm" id="ser-healthcheck.timeout" autoComplete="off" placeholder="" pattern={Constants.patterns.DURATION}></input>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group col">
                      <label htmlFor="ser-healthcheck.interval">Interval</label>
                      <input type="text" value={this.state.healthcheckInterval} onChange={this.handleVariableChange} onBlur={this.validateForm} className="form-control form-control-sm" id="ser-healthcheck.interval" autoComplete="off" placeholder="" pattern={Constants.patterns.DURATION}></input>
                    </div>
                    <div className="form-group col">
                      <label htmlFor="ser-healthcheck.start_period">Start period</label>
                      <input type="text" value={this.state.healthcheckStart_period} onChange={this.handleVariableChange} onBlur={this.validateForm} className="form-control form-control-sm" id="ser-healthcheck.start_period" autoComplete="off" placeholder="" pattern={Constants.patterns.DURATION}></input>
                    </div>
                  </div>
                </CollapsibleMenu>
                <CollapsibleMenu className="mt-2" label="Logging">
                  <div className="form-group mt-2">
                    <label htmlFor="ser-logging.driver">Driver</label>
                    <input type="text" value={this.state.loggingDriver} onChange={this.handleVariableChange} className="form-control form-control-sm" id="ser-logging.driver" defaultoption="json-file" autoComplete="off" placeholder=""></input>
                  </div>
                  <MultipleProperties id="logging.options" label="Options" onAdd={this.handleAdd}>
                    {
                      this.state.loggingOptions.map((option, i) => (
                        <MapEntry key={i} label="logging.options" object={option} index={i} onChange={this.handlePropsChanged} onRemove={this.handleRemove}></MapEntry>
                      ))
                    }
                  </MultipleProperties>
                </CollapsibleMenu>
                <CollapsibleMenu className="mt-2" label="Capabilities">
                  <MultipleProperties id="cap_add" label="Add" onAdd={this.handleAdd}>
                    {
                      this.state.cap_add.map((cap, i) => (
                        <SimpleEntry key={i} label="cap_add" entry={cap} index={i} onChange={this.handlePropsChanged} onRemove={this.handleRemove}></SimpleEntry>
                      ))
                    }
                  </MultipleProperties>
                  <MultipleProperties id="cap_drop" label="Drop" onAdd={this.handleAdd}>
                    {
                      this.state.buildLabels.map((cap, i) => (
                        <SimpleEntry key={i} label="cap_drop" entry={cap} index={i} onChange={this.handlePropsChanged} onRemove={this.handleRemove}></SimpleEntry>
                      ))
                    }
                  </MultipleProperties>
                </CollapsibleMenu>
                <CollapsibleMenu className="mt-2" label="Ulimits">
                  <div className="row">
                    <div className="col text-center">nproc</div>
                  </div>
                  <div className="form-row">
                    <div className="form-group col">
                      <label htmlFor="ser-ulimits.nproc.soft">Soft</label>
                      <input type="number" min="0" value={this.state.ulimitsNprocSoft} onChange={this.handleVariableChange} className="form-control form-control-sm" id="ser-ulimits.nproc.soft" autoComplete="off"></input>
                    </div>
                    <div className="form-group col">
                      <label htmlFor="ser-ulimits.nproc.hard">Hard</label>
                      <input type="number" min="0" value={this.state.ulimitsNprocHard} onChange={this.handleVariableChange} className="form-control form-control-sm" id="ser-ulimits.nproc.hard" autoComplete="off"></input>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col text-center">nofile</div>
                  </div>
                  <div className="form-row">
                    <div className="form-group col">
                      <label htmlFor="ser-ulimits.nofile.soft">Soft</label>
                      <input type="number" min="0" value={this.state.ulimitsNofileSoft} onChange={this.handleVariableChange} className="form-control form-control-sm" id="ser-ulimits.nofile.soft" autoComplete="off"></input>
                    </div>
                    <div className="form-group col">
                      <label htmlFor="ser-ulimits.nproc.hard">Hard</label>
                      <input type="number" min="0" value={this.state.ulimitsNofileHard} onChange={this.handleVariableChange} className="form-control form-control-sm" id="ser-ulimits.nofile.hard" autoComplete="off"></input>
                    </div>
                  </div>
                </CollapsibleMenu>
                <MultipleProperties id="devices" label="Devices" onAdd={this.handleAdd}>
                  {
                    this.state.devices.map((device, i) => (
                      <SimpleEntry key={i} label="devices" object={device} index={i} onChange={this.handlePropsChanged} onRemove={this.handleRemove}></SimpleEntry>
                    ))
                  }
                </MultipleProperties>
                <CollapsibleMenu className="mt-2" label="DNS">
                  <MultipleProperties id="dns" label="DNS" onAdd={this.handleAdd}>
                    {
                      this.state.dns.map((entry, i) => (
                        <SimpleEntry key={i} label="dns" entry={entry} index={i} onChange={this.handlePropsChanged} onRemove={this.handleRemove}></SimpleEntry>
                      ))
                    }
                  </MultipleProperties>
                  <MultipleProperties id="dns_search" label="DNS search" onAdd={this.handleAdd}>
                    {
                      this.state.dns_search.map((entry, i) => (
                        <SimpleEntry key={i} label="dns_search" entry={entry} index={i} onChange={this.handlePropsChanged} onRemove={this.handleRemove}></SimpleEntry>
                      ))
                    }
                  </MultipleProperties>
                </CollapsibleMenu>
                <div className="form-group my-1">
                  <label htmlFor="ser-stop_grace_period">Stop grace period</label>
                  <input type="text" value={this.state.stop_grace_period} onChange={this.handleVariableChange} onBlur={this.validateForm} className="form-control form-control-sm" id="ser-stop_grace_period" autoComplete="off" placeholder="" pattern={Constants.patterns.DURATION}></input>
                </div>
                <div className="form-group my-1">
                  <label htmlFor="ser-stop_signal">Stop signal</label>
                  <input type="text" value={this.state.stop_signal} onChange={this.handleVariableChange} onBlur={this.validateForm} className="form-control form-control-sm" id="ser-stop_signal" autoComplete="off" placeholder="" pattern={Constants.patterns.SIGNAL}></input>
                </div>
                <div className="form-group my-1">
                  <label htmlFor="ser-userns_mode">Userns mode</label>
                  <select value={this.state.userns_mode} onChange={this.handleVariableChange} id="ser-userns_mode" className="form-control form-control-sm" defaultoption="(default)">
                    <option>(default)</option>
                    <option>host</option>
                  </select>
                </div>
                <MultipleProperties id="tmpfs" label="Tmpfs" onAdd={this.handleAdd}>
                  {
                    this.state.tmpfs.map((tmpfs, i) => (
                      <SimpleEntry key={i} label="tmpfs" entry={tmpfs} index={i} onChange={this.handlePropsChanged} onRemove={this.handleRemove}></SimpleEntry>
                    ))
                  }
                </MultipleProperties>
                <CollapsibleMenu className="my-2" label="Run">
                  <div className="form-group my-1">
                    <label htmlFor="ser-user">User</label>
                    <input type="text" value={this.state.user} onChange={this.handleVariableChange} className="form-control form-control-sm" id="ser-user" autoComplete="off" placeholder=""></input>
                  </div>
                  <div className="form-group my-1">
                    <label htmlFor="ser-working_dir">Working dir</label>
                    <input type="text" value={this.state.working_dir} onChange={this.handleVariableChange} className="form-control form-control-sm" id="ser-working_dir" autoComplete="off" placeholder=""></input>
                  </div>
                  <div className="form-group my-1">
                    <label htmlFor="ser-domainname">Domain name</label>
                    <input type="text" value={this.state.domainname} onChange={this.handleVariableChange} className="form-control form-control-sm" id="ser-domainname" autoComplete="off" placeholder=""></input>
                  </div>
                  <div className="form-group my-1">
                    <label htmlFor="ser-hostname">Host name</label>
                    <input type="text" value={this.state.hostname} onChange={this.handleVariableChange} className="form-control form-control-sm" id="ser-hostname" autoComplete="off" placeholder=""></input>
                  </div>
                  <div className="form-group my-1">
                    <label htmlFor="ser-mac_address">Mac address</label>
                    <input type="text" value={this.state.mac_address} onChange={this.handleVariableChange} className="form-control form-control-sm" id="ser-mac_address" autoComplete="off" placeholder=""></input>
                  </div>
                  <div className="form-group my-1">
                    <label htmlFor="ser-shm_size">Shm size</label>
                    <input type="text" value={this.state.shm_size} onChange={this.handleVariableChange} onBlur={this.validateForm} className="form-control form-control-sm" id="ser-shm_size" autoComplete="off" placeholder="" pattern={Constants.patterns.SIZE}></input>
                  </div>
                  <div className="form-group my-1">
                    <label htmlFor="ser-ipc">IPC</label>
                    <select value={this.state.ipc} onChange={this.handleVariableChange} id="ser-ipc" className="form-control form-control-sm" defaultoption="">
                      <option></option>
                      <option>none</option>
                      <option>private</option>
                      <option>shareable</option>
                      <option>host</option>
                    </select>
                  </div>
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" checked={this.state.priviledged} onChange={this.handleCheckChange} id="ser-priviledged"></input>
                    <label className="form-check-label" htmlFor="ser-priviledged"> Priviledged</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" checked={this.state.read_only} onChange={this.handleCheckChange} id="ser-read_only"></input>
                    <label className="form-check-label" htmlFor="ser-read_only">Read only</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" checked={this.state.stdin_open} onChange={this.handleCheckChange} id="ser-stdin_open"></input>
                    <label className="form-check-label" htmlFor="ser-stdin_open">Stdin open</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" checked={this.state.tty} onChange={this.handleCheckChange} id="ser-tty"></input>
                    <label className="form-check-label" htmlFor="ser-tty">Tty</label>
                  </div>
                </CollapsibleMenu>
                <CollapsibleMenu className="mt-2" label="Credential spec">
                  <div className="form-group my-1">
                    <label htmlFor="ser-credential_spec.file">File</label>
                    <input type="text" value={this.state.credential_specFile} onChange={this.handleVariableChange} className="form-control form-control-sm" id="ser-credential_spec.file" autoComplete="off"></input>
                  </div>
                  <div className="form-group my-1">
                    <label htmlFor="ser-credential_spec.registry">Registry</label>
                    <input type="text" value={this.state.credential_specRegistry} onChange={this.handleVariableChange} className="form-control form-control-sm" id="ser-credential_spec.registry" autoComplete="off"></input>
                  </div>
                  <div className="form-group my-1">
                    <label htmlFor="ser-credential_spec.config">Config</label>
                    <input type="text" value={this.state.credential_specConfig} onChange={this.handleVariableChange} className="form-control form-control-sm" id="ser-credential_spec.config" autoComplete="off"></input>
                  </div>
                </CollapsibleMenu>
                <div className="form-group my-1">
                  <label htmlFor="ser-isolation">Isolation</label>
                  <select value={this.state.isolation} onChange={this.handleVariableChange} id="ser-isolation" className="form-control form-control-sm" defaultoption="default">
                    <option>default</option>
                    <option>process</option>
                    <option>hyperv</option>
                  </select>
                </div>
                <MultipleProperties id="sysctls" label="Sysctls" onAdd={this.handleAdd}>
                  {
                    this.state.sysctls.map((entry, i) => (
                      <MapEntry key={i} label="devices" object={entry} index={i} onChange={this.handlePropsChanged} onRemove={this.handleRemove}></MapEntry>
                    ))
                  }
                </MultipleProperties>
                <MultipleProperties id="expose" label="Expose" onAdd={this.handleAdd}>
                  {
                    this.state.expose.map((entry, i) => (
                      <SimpleEntry key={i} label="expose" entry={entry} index={i} onChange={this.handlePropsChanged} onRemove={this.handleRemove}></SimpleEntry>
                    ))
                  }
                </MultipleProperties>
                <MultipleProperties id="external_links" label="External links" onAdd={this.handleAdd}>
                  {
                    this.state.external_links.map((entry, i) => (
                      <SimpleEntry key={i} label="external_links" entry={entry} index={i} onChange={this.handlePropsChanged} onRemove={this.handleRemove}></SimpleEntry>
                    ))
                  }
                </MultipleProperties>
              </Tab>
              <Tab eventKey="deploy" title="Deploy">
                <div className="form-group my-1">
                  <label htmlFor="ser-deploy.endpoint_mode">Mode</label>
                  <select value={this.state.deployMode} onChange={this.handleVariableChange} id="ser-deploy.mode" className="form-control form-control-sm" defaultoption="replicated">
                    <option>replicated</option>
                    <option>global</option>
                  </select>
                </div>
                <div className="form-row mt-1">
                  <div className="col form-group my-1">
                    <label htmlFor="ser-deploy.replicas">Replicas</label>
                    <input type="number" min="1" value={this.state.deployReplicas} defaultoption="1" onChange={this.handleVariableChange} className="form-control form-control-sm" id="ser-deploy.replicas"></input>
                  </div>
                  <div className="col form-group my-1">
                    <label htmlFor="ser-deploy.max_replicas_per_node">Max per node</label>
                    <input type="number" min="1" value={this.state.deployMax_replicas_per_node} onChange={this.handleVariableChange} className="form-control form-control-sm" id="ser-deploy.max_replicas_per_node"></input>
                  </div>
                </div>
                <div className="form-group my-1">
                  <label htmlFor="ser-deploy.endpoint_mode">Endpoint mode</label>
                  <select value={this.state.deployEndpoint_mode} defaultoption="1" onChange={this.handleVariableChange} id="ser-deploy.endpoint_mode" className="form-control form-control-sm">
                    <option>vip</option>
                    <option>dnsrr</option>
                  </select>
                </div>
                <CollapsibleMenu className="mt-2" label="Placement">
                  <MultipleProperties id="deploy.placement.constraints" label="Constraints" onAdd={this.handleAdd}>
                    {
                      this.state.deployPlacementConstraints.map((constraint, i) => (
                        <MapEntry key={i} label="deploy.placement.constraints" object={constraint} index={i} onChange={this.handlePropsChanged} onRemove={this.handleRemove}></MapEntry>
                      ))
                    }
                  </MultipleProperties>
                  <MultipleProperties id="deploy.placement.preferences" label="Preferences" onAdd={this.handleAdd}>
                    {
                      this.state.deployPlacementPreferences.map((pref, i) => (
                        <DeployPlacementPreferencesEntry key={i} label="deploy.placement.preferences" object={pref} index={i} onChange={this.handlePropsChanged} onRemove={this.handleRemove}></DeployPlacementPreferencesEntry>
                      ))
                    }
                  </MultipleProperties>
                </CollapsibleMenu>
                <CollapsibleMenu className="mt-2" label="Resources">
                  <div className="row">
                    <div className="col text-center">Limits</div>
                  </div>
                  <div className="form-row">
                    <div className="form-group col">
                      <label htmlFor="ser-deploy.resources.limits.cpus">CPUs</label>
                      <input type="text" value={this.state.deployResourcesLimitsCpus} onChange={this.handleVariableChange} onBlur={this.validateForm} className="form-control form-control-sm" id="ser-deploy.resources.limits.cpus" pattern={Constants.patterns.PERCENTAGE} autoComplete="off" placeholder=""></input>
                    </div>
                    <div className="form-group col">
                      <label htmlFor="tag">Memory</label>
                      <input type="text" value={this.state.deployResourcesLimitsMemory} onChange={this.handleVariableChange} onBlur={this.validateForm} className="form-control form-control-sm" id="ser-deploy.resources.limits.memory" pattern={Constants.patterns.SIZE} autoComplete="off" placeholder=""></input>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col text-center">Reservations</div>
                  </div>
                  <div className="form-row">
                    <div className="form-group col">
                      <label htmlFor="ser-deploy.resources.limits.cpus">CPUs</label>
                      <input type="text" value={this.state.deployResourcesReservationsCpus} onChange={this.handleVariableChange} onBlur={this.validateForm} className="form-control form-control-sm" id="ser-deploy.resources.reservations.cpus" pattern={Constants.patterns.PERCENTAGE} autoComplete="off" placeholder=""></input>
                    </div>
                    <div className="form-group col">
                      <label htmlFor="tag">Memory</label>
                      <input type="text" value={this.state.deployResourcesReservationsMemory} onChange={this.handleVariableChange} onBlur={this.validateForm} className="form-control form-control-sm" id="ser-deploy.resources.reservations.memory" pattern={Constants.patterns.SIZE} autoComplete="off" placeholder=""></input>
                    </div>
                  </div>
                </CollapsibleMenu>
                <CollapsibleMenu className="mt-2" label="Restart policy">
                  <label htmlFor="ser-deploy.restart_policy.condition">Condition</label>
                  <select value={this.state.deployRestart_policyCondition} defaultoption="any" onChange={this.handleVariableChange} id="ser-deploy.restart_policy.condition" className="form-control form-control-sm">
                    <option>any</option>
                    <option>on-failure</option>
                    <option>none</option>
                  </select>
                  <div className="form-group mt-2">
                    <label htmlFor="ser-deploy.restart_policy.delay">Delay</label>
                    <input type="text" value={this.state.deployRestart_policyDelay} onChange={this.handleVariableChange} onBlur={this.validateForm} defaultoption="0s" className="form-control form-control-sm" id="ser-deploy.restart_policy.delay" autoComplete="off" placeholder="" pattern={Constants.patterns.DURATION}></input>
                  </div>
                  <div className="form-group mt-2">
                    <label htmlFor="ser-deploy.restart_policy.max_attempts">Max attempts</label>
                    <input type="text" value={this.state.deployRestart_policyMax_attempts} onChange={this.handleVariableChange} className="form-control form-control-sm" id="ser-deploy.restart_policy.max_attempts" autoComplete="off" placeholder=""></input>
                  </div>
                  <div className="form-group mt-2">
                    <label htmlFor="ser-deploy.restart_policy.window">Window</label>
                    <input type="text" value={this.state.deployRestart_policyWindow} onChange={this.handleVariableChange} onBlur={this.validateForm} defaultoption="0s" className="form-control form-control-sm" id="ser-deploy.restart_policy.window" autoComplete="off" placeholder="" pattern={Constants.patterns.DURATION}></input>
                  </div>
                </CollapsibleMenu>
                <CollapsibleMenu className="mt-2" label="Rollback configuration">
                  <div className="form-group col">
                    <label htmlFor="ser-deploy.rollback_config.parallelism">Parallelism</label>
                    <input type="number" min="0" value={this.state.deployRollback_configParallelism} onChange={this.handleVariableChange} className="form-control form-control-sm" id="ser-deploy.rollback_config.parallelism" autoComplete="off" placeholder=""></input>
                  </div>
                  <div className="form-group col">
                    <label htmlFor="ser-deploy.rollback_config.delay">Delay</label>
                    <input type="text" value={this.state.deployRollback_configDelay} onChange={this.handleVariableChange} defaultoption="0s" className="form-control form-control-sm" id="ser-deploy.rollback_config.delay" autoComplete="off" placeholder=""></input>
                  </div>
                  <div className="form-group col">
                    <label htmlFor="ser-deploy.rollback_config.max_failure_ratio">Max failure ratio</label>
                    <input type="number" min="0" value={this.state.deployRollback_configMax_failure_ratio} onChange={this.handleVariableChange} defaultoption="0" className="form-control form-control-sm" id="ser-deploy.rollback_config.max_failure_ratio" autoComplete="off" placeholder=""></input>
                  </div>
                  <label htmlFor="ser-deploy.rollback_config.failure_action">Failure action</label>
                  <select value={this.state.deployRollback_configFailure_action} onChange={this.handleVariableChange} defaultoption="pause" id="ser-deploy.rollback_config.failure_action" className="form-control form-control-sm">
                    <option>pause</option>
                    <option>continue</option>
                  </select>
                  <label htmlFor="ser-deploy.rollback_config.order">Order</label>
                  <select value={this.state.deployRollback_configOrder} defaultoption="stop-first" onChange={this.handleVariableChange} id="ser-deploy.rollback_config.order" className="form-control form-control-sm">
                    <option>stop-first</option>
                    <option>start-first</option>
                  </select>
                  <div className="form-group mt-2">
                    <label htmlFor="ser-deploy.rollback_config.monitor">Monitor</label>
                    <input type="text" value={this.state.deployRollback_configMonitor} onChange={this.handleVariableChange} onBlur={this.validateForm} defaultoption="0s" className="form-control form-control-sm" id="ser-deploy.rollback_config.monitor" autoComplete="off" placeholder="" pattern={Constants.patterns.DURATION}></input>
                  </div>
                </CollapsibleMenu>
                <CollapsibleMenu className="mt-2" label="Update configuration">
                  <div className="form-group col">
                    <label htmlFor="ser-deploy.update_config.parallelism">Parallelism</label>
                    <input type="number" min="0" value={this.state.deployUpdate_configParallelism} onChange={this.handleVariableChange} className="form-control form-control-sm" id="ser-deploy.update_config.parallelism" autoComplete="off" placeholder=""></input>
                  </div>
                  <div className="form-group col">
                    <label htmlFor="ser-deploy.update_config.delay">Delay</label>
                    <input type="text" value={this.state.deployUpdate_configDelay} onChange={this.handleVariableChange} defaultoption="0s" className="form-control form-control-sm" id="ser-deploy.update_config.delay" autoComplete="off" placeholder=""></input>
                  </div>
                  <div className="form-group col">
                    <label htmlFor="ser-deploy.update_config.max_failure_ratio">Max failure ratio</label>
                    <input type="number" min="0" value={this.state.deployUpdate_configMax_failure_ratio} onChange={this.handleVariableChange} defaultoption="0" className="form-control form-control-sm" id="ser-deploy.update_config.max_failure_ratio" autoComplete="off" placeholder=""></input>
                  </div>
                  <label htmlFor="ser-deploy.update_config.failure_action">Failure action</label>
                  <select value={this.state.deployUpdate_configFailure_action} onChange={this.handleVariableChange} defaultoption="pause" id="ser-deploy.update_config.failure_action" className="form-control form-control-sm">
                    <option>pause</option>
                    <option>continue</option>
                  </select>
                  <label htmlFor="ser-deploy.update_config.order">Order</label>
                  <select value={this.state.deployUpdate_configOrder} onChange={this.handleVariableChange} defaultoption="stop-first" id="ser-deploy.update_config.order" className="form-control form-control-sm">
                    <option>stop-first</option>
                    <option>start-first</option>
                  </select>
                  <div className="form-group mt-2">
                    <label htmlFor="ser-deploy.update_config.monitor">Monitor</label>
                    <input type="text" value={this.state.deployUpdate_configMonitor} onChange={this.handleVariableChange} onBlur={this.validateForm} defaultoption="0s" className="form-control form-control-sm" id="ser-deploy.update_config.monitor" autoComplete="off" placeholder="" pattern={Constants.patterns.DURATION}></input>
                  </div>
                </CollapsibleMenu>
                <MultipleProperties id="deploy.labels" label="Labels" onAdd={this.handleAdd}>
                  {
                    this.state.deployLabels.map((label, i) => (
                      <MapEntry key={i} label="deploy.labels" object={label} index={i} onChange={this.handlePropsChanged} onRemove={this.handleRemove}></MapEntry>
                    ))
                  }
                </MultipleProperties>
              </Tab>
            </Tabs>
          </form>
        </div>
      </div>
    );
  }
}
