import React from "react";
import Properties from './properties';
import MultipleProperties from './multipleProperties';
import MapEntry from './entries/mapEntry';
import Constants from '../../constants';

export default class VolumeProperties extends Properties {
  
  initializeState(){
    const state = {
      key: this.selectedCell.getAttribute('name'),
      driver: this.selectedCell.props.driver || '',
      driver_opts: this.selectedCell.props.driver_opts || [],
      name: this.selectedCell.props.name || '',
      external: this.selectedCell.props.external || false,
      labels: this.selectedCell.props.labels || []
    }

    Constants.attributes.volumes.mapEntries.forEach(e =>
      state[e] = this.setMap(state[e])
    );

    return state;
  }

  addEntry = (variable) => {
    if(Constants.attributes.volumes.mapEntries.includes(variable))
      this.setState({ [variable]: [...this.state[variable], { key: '', value: '' }] });
  }

  render(){
	  return (
      <div id="props_vol" className="properties overflow-auto">
        <div className="m-2">
          <form>
            <div className="form-group my-1">
              <label htmlFor="vol-key">Key</label>
              <input type="text" value={this.state.key} ref={this.keyInput} onChange={this.handleKeyChange} onBlur={() => {this.validateKey(); this.validateForm()}} className="form-control form-control-sm" id="vol-key" autoComplete="off" placeholder="e.g. my-volume" required></input>
            </div>
            <div className="form-group my-1">
              <label htmlFor="vol-name">Name</label>
              <input type="text" value={this.state.name} onChange={this.handleVariableChange} className="form-control form-control-sm" id="vol-name" autoComplete="off" placeholder=""></input>
            </div>
            <div className="form-group my-1">
              <label htmlFor="vol-driver">Driver</label>
              <input type="text" value={this.state.driver} onChange={this.handleVariableChange} className="form-control form-control-sm" id="vol-driver" autoComplete="off" placeholder="local"></input>
            </div>
            <MultipleProperties id="driver_opts" label="Driver options" onAdd={this.handleAdd}>
              {
                this.state.driver_opts.map((opt,i) => (
                  <MapEntry key={i} label="driver_opts" object={opt} index={i} onChange={this.handlePropsChanged} onRemove={this.handleRemove}></MapEntry>
                ))
              }
            </MultipleProperties>
            <div className="form-check my-2">
              <input className="form-check-input" type="checkbox" checked={this.state.external} onChange={this.handleVariableChange} id="vol-external"></input>
              <label className="form-check-label" htmlFor="vol-external">External</label>
            </div>
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