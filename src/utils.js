import Constants from './constants';

export function leaf(obj, path, value = {}) {
  const variables = path.split('.');

  let i = 0;
  for(i; i < variables.length-1; i++){
    const val = variables[i];
    if(!obj[val]) 
      obj[val] = {}; 
    obj = obj[val];
  }

  obj[variables[i]] = value;
};

export function leafSelect(obj, path) {
  const variables = path.split('.');

  let i = 0;
  for(i; i < variables.length-1; i++){
    const val = variables[i];
    if(!obj[val])
      return undefined;
    obj = obj[val];
  }

  return obj[variables[i]]
};

/** BUILD attribute **/
export function setBuild(obj, path = 'build'){
  if(obj[path] === undefined)
    return;
  
  const keys = Object.keys(obj[path]);
  if(keys.length === 1 && keys[0] === 'context')
    obj[path] = obj[path].context;
}

export function readBuild(obj, path = 'build'){
  if(obj[path] === undefined)
    return;
  
  if(typeof obj[path] === 'string')
    obj[path] = { context: obj[path] };
}

/** PORTS attribute **/
export function setPorts(obj, shortSyntax = true){
  const path = 'ports'
  if(obj[path] === undefined)
    return;

  obj[path] = obj[path].reduce((res, o) => {
    if(isSet(o, 'target')){
      if(shortSyntax && !isSet(o, 'mode', 'host'))
        res.push( (o.published ? `${o.published}:` : '') + o.target + (o.protocol ? '/udp' : '') );
      else{
        if(o.protocol)
          o.protocol = "udp"
        res.push(o);
      }
    }

    return res;
  }, []);

  if(obj[path].length === 0)
    delete obj[path];
}

export function readPorts(obj, path = 'ports'){
  if(obj[path] === undefined)
    return;

  obj[path] = obj[path].map(o => {
      // Short syntax
    if(typeof o === 'string' || typeof o === 'number'){
      let res = {};
      const elems = (''+o).split(':');
      
      let protocol = undefined;
      if((''+elems[elems.length-1]).includes('/')){
        const innerElems = elems[elems.length-1].split('/')
        elems[elems.length-1] = innerElems[0];
        if(protocol !== "tcp")
          protocol = "UDP";
      }

      if(elems.length === 1)
        res = {
          target: elems[0]
        };
      else if(elems.length === 2)
        res = {
          published: elems[0],
          target: elems[1],
        };
      else if(elems.length === 3)
        res = {
          published: `${elems[0]}:${elems[1]}`,
          target: elems[2],
        };

      if(protocol)
        res.protocol = protocol;

      return res;
    }
    else
      return o;
  });
}

/** ULIMITS attribute **/
export function setUlimits(obj, path = 'ulimits') {
  if(obj[path] === undefined)
    return;

  for(let key in obj[path]){

    // Set to number if hard and soft values are equal
    if(obj[path][key].soft && obj[path][key].hard)
      if(parseInt(obj[path][key].soft) === parseInt(obj[path][key].hard))
        obj[path][key] = obj[path][key].soft;
  }
}

export function readUlimits(obj, path = 'ulimits'){
  if(obj[path] === undefined)
    return;

  for(let key in obj[path]){
    if(typeof obj[path][key] === 'number')
      obj[path][key] = {
        soft: obj[path][key],
        hard: obj[path][key]
      };
  }
}

/** CONFIGS MODE attribute **/
export function setConfigMode(obj, path = 'mode') {
  if(obj[path] === undefined)
    return;

  if(typeof obj[path] === 'number'){
    const octal = obj[path].toString(8)
    obj[path] = "0".repeat(4-octal.length)+octal;
  }
}

export function setArrayValues(obj, asString = true, paths = []){
  paths.forEach(p =>
    setArrayValue(obj, p, asString)
  );
}

function setArrayValue(obj, path, asString){ 
  let val = undefined
  if((val = leafSelect(obj, path)) === undefined)
    return;

  val = val.trim().replace(/\s+|\n/g, " ");

  if(path === 'healthcheck.test')
    val = "CMD "+val;

  if(!asString)
    setVariable(obj, path, val.split(' '));
  else
    setVariable(obj, path, val);

}

export function readSingleArrayValues(obj, paths = []){
  paths.forEach(p => {
    let val;
    if((val = leafSelect(obj, p)) === undefined)
      return;

    if(!Array.isArray(val)){
      setVariable(obj, p, [val]);
    }
  });
}

export function setSingleArrayValues(obj, paths = []){
  paths.forEach(p => {
    let val;
    if((val = leafSelect(obj, p)) === undefined)
      return;

    if(val.length === 1){
      setVariable(obj, p, val[0]);
    }
  });
}

export function readCommandValues(obj, paths = []){
  paths.forEach(p =>
    readCommandValue(obj, p)
  );
}

function readCommandValue(obj, path){ 
  let val;
  if((val = leafSelect(obj, path)) === undefined)
    return;

  if(Array.isArray(val)){
    if(path === 'healthcheck.test'){
      val.shift();
      setVariable(obj, path, val.join(' '));
    }
    else
      setVariable(obj, path, val.join(' '));
  }
}

/** LINKS attribute **/
export function setLinks(obj, path='links'){
  if(obj[path] === undefined)
    return;
}

export function readLink(obj){
  const elems = obj.split(':');
  if(elems.length === 2)
    return { 
      target: elems[0],
      alias: elems[1] 
    };
  else
    return { target: obj };
}

/** VOLUMES attribute **/
export function setVolumes(obj, shortSyntax = true){
  const path = 'volumes';
  if(obj[path] === undefined)
    return;

  obj[path] = obj[path].reduce((res, o) => {

    //Short syntax
    if(shortSyntax && !(isSet(o, 'volume.no_copy')
      || isSet(o, 'tmpfs.size')
      || isSet(o, 'bind.propagation')
      || isSet(o, 'type')
      || isSet(o, 'consistency'))){
      
      if(isSet(o, 'target'))
        res.push( (o.source ? `${o.source}:` : '') + o.target + (o.read_only ? ':ro' : '') );
    }
    else{
      if(Object.keys(o).length > 0)
        res.push(o);
    }

    return res;
  }, []);

  if(obj[path].length === 0)
    delete obj[path];
}

export function setVolume(obj, source){
  return `${source}:${obj.target}`+ (isSet(obj, 'read_only', false) ? ':ro': '');
}

export function readVolume(obj){
  if(typeof obj === 'string'){
    let res = {};
    const elems = obj.split(':');

    if(elems.length === 1)
      res = {
        target: elems[0]
      };
    else if(elems.length === 2)
      res = {
        source: elems[0],
        target: elems[1],
      };
    else if(elems.length === 3){

      res = {
        source: elems[0],
        target: elems[1],
      };

      if(elems[2] === 'ro')
        res.read_only = true;
    }

    return res;
  }
  else
    return obj;
}

export function readExternal(obj, path='external'){
  let val;
  if((val = leafSelect(obj, path)) === undefined)
    return;

  if(typeof val === 'object'){
    if(val.name)
      setVariable(obj, 'name', val.name);
  
    setVariable(obj, 'external', true);
  }
}

/** CONFIG and SECRET attributes **/
export function readConfigOrSecret(obj){
  if(typeof obj === 'string')
    return { source: obj };
  else 
    return obj;
}

/** MAP attributes **/
export function setKeyValues(obj, path, array = true){
  const source = leafSelect(obj, path);
  if(source === undefined)
    return;

  let map = {};

  if((array && (path !== 'logging.options' && path !== 'driver_opts'))
    || path === 'deploy.placement.constraints') {
    map = source.reduce((res, o) => {
    
      const separator = path === 'deploy.placement.constraints' ? '==' : '=';
      if(o.key && o.value)
        res.push(o.key + (o.value ? `${separator}${o.value}` : ''));

      return res;
    }, []);

    if(map.length === 0)
      map = [];
  }
  else {
    source.forEach(o => {
      if(o.key && o.value)
        map[o.key] = o.value
    });

    if(Object.keys(map).length === 0)
      map = [];
  }

  if(map.length === 0)
    setVariable(obj, path, map, []);
  else
    setVariable(obj, path, map);
}

export function readKeyValues(obj, path){
  const source = leafSelect(obj, path);
  if(source === undefined)
    return;

  let res = [];
  if(Array.isArray(source)){
    res = source.map(i => {
      const separator = path === 'deploy.placement.constraints' ? '==' : '=';
      const values = i.split(separator);
      if(values.length === 1)
        return { key: i };
      else
        return {
          key: values[0],
          value: values[1] || ''
        };
    });
  }
  else if(typeof source === 'object'){
    for(let key in source){
      res.push({
        key: key,
        value: source[key] || ''
      });
    }
  }

  setVariable(obj, path, res);
}

export function getTargetValue(target){
  if(target.nodeName === 'INPUT' && target.getAttribute('type') === 'checkbox')
    return target.checked;
  else
    return target.value;
}

export function isSet(obj, path, standard){
  if(path === '*'){
    for(let key in obj){
      if(isSetAux(obj, key, standard))
        return true;
    }

    return false;
  }

  return isSetAux(obj, path, standard);
}


function isSetAux(obj, path, standard){
  const variables = path.split('.');

  let i = 0;
  for(i; i < variables.length-1; i++){
    const val = variables[i];
    if(!obj[val]) 
      return false;
    obj = obj[val];
  }

  const val = obj[variables[i]];

  if(standard){
    if(val)
      return val !== standard;
    else
      return false;
  }

  if(val){
    if(typeof val === 'string')
      return val !== ''
    else if(Array.isArray(val))
      return val.length > 0;
    else if(typeof val === 'boolean')
      return val;
    else if(typeof val === 'number')
      return true;
  }

  return false;
}

export function setVariable(obj, path, value, standard){
  const variables = path.split('.');

  const objs = [obj];

  // Iterate through objects according to path
  let i = 0;
  for(i; i < variables.length-1; i++){
    const val = variables[i];
    if(!obj[val]) 
      obj[val] = {}; 
    obj = obj[val];
    objs.push(obj);
  }

  obj[variables[i]] = value;

  // Remove property if default or empty
  if(standard){
    if(value === standard)
      delete obj[variables[i]];
    
    if(Array.isArray(standard) && !standard.length)
      delete obj[variables[i]];
  }

  if((typeof value === 'string' && value === '')
    || (typeof value === 'boolean' && !value)){
    delete obj[variables[i]];
  }

  // Remove empty objects
  for(i--; i >= 0; i--){
    if(Object.keys(objs[i+1]).length === 0)
      delete objs[i][variables[i]];
    else
      break;
  }
}

export function getStateVariable(path){
  return path.split('.').reduce((res, current, index) => 
    res += (index !== 0 ?  current.charAt(0).toUpperCase() + current.slice(1) : current)
  );
}

export function getPathVariable(stateVariable){
  return stateVariable.split(/(?=[A-Z])/).reduce( (res, current, index) => 
    res += (index !== 0 ? '.'+current.charAt(0).toLowerCase() + current.slice(1) : current)
  );
}

export function getOS(){
  let OSName="Unknown OS";
  if (navigator.appVersion.indexOf("Win") !== -1) OSName="Windows";
  if (navigator.appVersion.indexOf("Mac") !== -1) OSName="MacOS";
  if (navigator.appVersion.indexOf("X11") !== -1) OSName="UNIX";
  if (navigator.appVersion.indexOf("Linux") !== -1) OSName="Linux";

  return OSName;
}

export function getErrorSummary(obj){
  let summary = "";

  for(let key in obj){
    if(obj[key] !== "")
      summary += obj[key]+'\n';
  }
  return summary;
}

// Delete outside properties from a service
export function cleanService(obj){
  delete obj.depends_on;
  delete obj.links;
  delete obj.volumes;
  delete obj.networks;
  delete obj.configs;
  delete obj.secrets;
}

export function setServiceProps(cell, preferShortSyntax=true, stringCommands=true, arrayMapVariables=true) {
  let serviceProps = JSON.parse(JSON.stringify(cell.props));
  setPorts(serviceProps, preferShortSyntax);
  setBuild(serviceProps);
  setUlimits(serviceProps);
  setVolumes(serviceProps, preferShortSyntax);
  // setNetworks(serviceProps);
  setSingleArrayValues(serviceProps, Constants.attributes.services.singleArrayEntries);
  setArrayValues(serviceProps, stringCommands, Constants.attributes.services.commands);
  Constants.attributes.services.mapEntries.forEach(e =>
    setKeyValues(serviceProps, getPathVariable(e), arrayMapVariables)
  );

  // Add dependency props
  cell.children.forEach((child) => {

    if (child.edges && child.edges !== null) {

      let dependencies = [];
      if (child.value === "depends_on") {
        dependencies = child.edges.map((e) => e.target.getAttribute('name'));
      }

      if (child.value === "links") {
        dependencies = child.edges.map((e) => {
          let link = e.target.getAttribute('name');
          if (e.props.alias)
            link = `${link}:${e.props.alias}`;

          return link;
        });
      }

      if (child.value === "volumes") {
        const namedVolumes = child.edges.map((e) => {

          //Check if short syntax can be used
          if (preferShortSyntax && 
                !(isSet(e.props, 'volume.nocopy', false)
                || isSet(e.props, 'consistency', 'consistent'))) {
            return setVolume(e.props, e.target.getAttribute('name'));
          }
          else {
            let volumesProps = JSON.parse(JSON.stringify(e.props));
            volumesProps.source = e.target.getAttribute('name');
            return volumesProps;
          }
            
        });

        if (serviceProps.volumes)
          serviceProps.volumes = serviceProps.volumes.concat(namedVolumes);
        else
          serviceProps.volumes = namedVolumes;
      }

      if (child.value === "networks") {
        dependencies = {};

        // Check if short syntax can be used
        let shortSyntax = true;
        child.edges.forEach((e) => {
          if (isSet(e.props, '*'))
            shortSyntax = false;
        });

        if (preferShortSyntax && shortSyntax) {
          dependencies = child.edges.map((e) => {
            return e.target.getAttribute('name');
          });
        }
        else {
          child.edges.forEach((e) => {
            dependencies[e.target.getAttribute('name')] = e.props;
          });
        }
      }

      if (child.value === "configs" || child.value === "secrets") {
        dependencies = child.edges.map((e) => {

          // Check if short syntax can be used
          if (preferShortSyntax && !isSet(e.props, '*')) {
            return e.target.getAttribute('name');
          }
          else {
            let props = JSON.parse(JSON.stringify(e.props));
            props.source = e.target.getAttribute('name');
            return props;
          }
        });
      }

      if (dependencies.length > 0 || Object.keys(dependencies).length > 0)
        serviceProps[child.value] = dependencies;
    }
  });

  return serviceProps;
}

export function setVolumeProps(cell, arrayMapVariables=true) {
  let props = JSON.parse(JSON.stringify(cell.props));
  Constants.attributes.volumes.mapEntries.forEach(e => {
    setKeyValues(props, getPathVariable(e), arrayMapVariables)
  });

  return props; 
}

export function setNetworkProps(cell, arrayMapVariables=true) {
  let props = JSON.parse(JSON.stringify(cell.props));
  Constants.attributes.networks.mapEntries.forEach(e => {
    setKeyValues(props, getPathVariable(e), arrayMapVariables)
  });

  return props;
}

export function setConfigOrSecretProps(cell) {
  return cell.props
}

export function setNodeProps(cell, preferShortSyntax=true, stringCommands=true, arrayMapVariables=true){
  switch (cell.type) {
    case 'service':
      return setServiceProps(cell, preferShortSyntax, stringCommands, arrayMapVariables);
    case 'volume':
      return setVolumeProps(cell, arrayMapVariables);
    case 'network':
      return setNetworkProps(cell, arrayMapVariables);
    case 'config':
      return setConfigOrSecretProps(cell);
    case 'secret':
      return setConfigOrSecretProps(cell);
    default:
      return {}
  }
}

