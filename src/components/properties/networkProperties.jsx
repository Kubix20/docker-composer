import React from "react";
import Properties from './properties';
import MultipleProperties from './multipleProperties';
import CollapsibleMenu from './collapsibleMenu';
import IpamConfigEntry from './entries/ipamConfigEntry';
import MapEntry from './entries/mapEntry';
import Constants from '../../constants';
import { leafSelect } from '../../utils';

export default class NetworkProperties extends Properties {
  
  initializeState(){
    const state = {
      key: this.selectedCell.getAttribute('name'),
      driver: this.selectedCell.props.driver || 'bridge',
      driver_opts: this.selectedCell.props.driver_opts || [],
      name: this.selectedCell.props.name || '',
      external: this.selectedCell.props.external || false,
      internal: this.selectedCell.props.internal || false,
      attachable: this.selectedCell.props.attachable || false,
      labels: this.selectedCell.props.labels || [],
      ipamDriver: leafSelect(this.selectedCell.props, 'ipam.driver') || 'default',
      ipamConfig: this.setIpamConfigs(leafSelect(this.selectedCell.props, 'ipam.config')) || []
    };

    Constants.attributes.networks.mapEntries.forEach(e =>
      state[e] = this.setMap(state[e])
    )

    return state;
  }

  setIpamConfigs(array) {
    if (!array)
      return undefined;

    return array.map(o => {
      console.log(o);
      return {
        subnet: o.subnet || '',
      };
    });
  }

  addEntry = (variable) => {
    if(Constants.attributes.networks.mapEntries.includes(variable))
      this.setState({ [variable]: [...this.state[variable], { key: '', value: '' }] });
    else if(variable === 'ipamConfig')
      this.setState({ ipamConfig: [...this.state.ipamConfig, {subnet: ''}]});
  }

  render(){
	  return (
      <div id="props_net" className="properties overflow-auto">
        <div className="m-2" style={{height: "auto"}}>
          <form>
            <div className="form-group my-1">
              <label htmlFor="net-key">Key</label>
              <input type="text" value={this.state.key} ref={this.keyInput} onChange={this.handleKeyChange} onBlur={() => {this.validateKey(); this.validateForm()}} className="form-control form-control-sm" id="net-key" autoComplete="off" placeholder="e.g. my-network" required></input>
            </div>
            <div className="form-group my-1">
              <label htmlFor="net-name">Name</label>
              <input type="text" value={this.state.name} onChange={this.handleVariableChange} className="form-control form-control-sm" id="net-name" autoComplete="off" placeholder=""></input>
            </div>
            <div className="form-group my-1">
              <label htmlFor="net-driver">Driver</label>
              <select value={this.state.driver} onChange={this.handleVariableChange} id="net-driver" className="form-control form-control-sm">
                <option>bridge</option>
                <option>overlay</option>
              </select>
            </div>
            <MultipleProperties id="driver_opts" label="Driver options" onAdd={this.handleAdd}>
              {
                this.state.driver_opts.map((opt,i) => (
                  <MapEntry key={i} label="driver_opts" object={opt} index={i} onChange={this.handlePropsChanged} onRemove={this.handleRemove}></MapEntry>
                ))
              }
            </MultipleProperties>
            <div className="form-check my-1">
              <input className="form-check-input" type="checkbox" checked={this.state.external} onChange={this.handleVariableChange} id="net-external"></input>
              <label className="form-check-label" htmlFor="net_external">
                External
              </label>
            </div>
            <div className="form-check my-1">
              <input className="form-check-input" type="checkbox" checked={this.state.internal} onChange={this.handleVariableChange} value="" id="net-internal"></input>
              <label className="form-check-label" htmlFor="net_internal">
                Internal
              </label>
            </div>
            <div className="form-check my-1">
              <input className="form-check-input" type="checkbox" checked={this.state.attachable} onChange={this.handleVariableChange} value="" id="net-attachable"></input>
              <label className="form-check-label" htmlFor="net_attachable">
                Attachable
              </label>
            </div>
            <CollapsibleMenu className="mt-0" label="Ipam">
              <div className="form-group my-1">
                <label htmlFor="net-ipam.driver">Driver</label>
                <input type="text" value={this.state.ipamDriver} onChange={this.handleVariableChange} className="form-control form-control-sm" id="net-ipam.driver" defauloption="default" autoComplete="off" placeholder=""></input>
              </div>
              <MultipleProperties id="ipam.config" label="Config" onAdd={this.handleAdd}>
                {
                  this.state.ipamConfig.map((conf,i) => (
                    <IpamConfigEntry key={i} label="ipam.config" config={conf} index={i} onChange={this.handlePropsChanged} onRemove={this.handleRemove}></IpamConfigEntry>
                  ))
                }
              </MultipleProperties>
            </CollapsibleMenu>
            <MultipleProperties id="labels" label="Labels" onAdd={this.handleAdd}>
              {
                this.state.labels.map((label,i) => (
                  <MapEntry key={i} label="labels" object={label} index={i} onChange={this.handlePropsChanged} onRemove={this.handleRemove}></MapEntry>
                ))
              }
            </MultipleProperties>
          </form>
        </div>
      </div>
		);
	}
}