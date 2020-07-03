import React from "react";
import Properties from './properties'
import { leaf } from '../../utils';

export default class VolumeConnectionProperties extends Properties {

  initializeState(){
    return {
      target: this.selectedCell.props.target || '',
      read_only: this.selectedCell.props.read_only || false,
      nocopy: this.selectedCell.props.volume ? this.selectedCell.props.volume.nocopy : false,
      consistency: this.selectedCell.props.consistency || 'consistent' 
    };
  }

  handleCheckChange = (e) => {
    const variable = e.target.id.split('-')[1];
    const stateVariables = variable.split('.');
    const stateVariable = stateVariables[stateVariables.length-1];
    this.setState({[stateVariable]: e.target.checked});
    leaf(this.selectedCell.props, variable, e.target.checked);
  }

  render(){
	  return (
      <div id="props_net" className="properties overflow-auto">
        <div className="m-2">
          <form>
            <div className="form-group">
              <label htmlFor="vols_target">Target</label>
              <input type="text" value={this.state.target} onChange={this.handleVariableChange} className="form-control form-control-sm" id="vols-target" autoComplete="off" placeholder=""></input>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" checked={this.state.read_only} onChange={this.handleCheckChange} id="vols-read_only"></input>
              <label className="form-check-label" htmlFor="vols-read_only">
                Read only
              </label>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" checked={this.state.nocopy} onChange={this.handleCheckChange} id="vols-volume.nocopy"></input>
              <label className="form-check-label" htmlFor="vols-nocopy">
                No copy
              </label>
            </div>
            <div className="form-group mt-2">
              <label htmlFor="vols-consistency">Consistency</label>
              <select value={this.state.consistency} onChange={this.handleVariableChange} id="vols-consistency" className="form-control form-control-sm">
                <option>consistent</option>
                <option>cached</option>
                <option>delegated</option>
              </select>
            </div>
          </form>
        </div>
      </div>
		);
	}
}