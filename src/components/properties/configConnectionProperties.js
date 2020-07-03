import React from "react";
import Properties from './properties';
import Constants from '../../constants';

export default class ConfigConnectionProperties extends Properties {

  initializeState(){
    return {
      target: this.selectedCell.props.target || '',
      uid: this.selectedCell.props.uid || 0,
      gid: this.selectedCell.props.gid || 0,
      mode: this.selectedCell.props.mode || ''
    };
  }

  render(){
	  return (
      <div id="props_ser" className="properties overflow-auto">
        <div className="m-2" style={{height: "auto"}}>
          <form>
            <div className="form-group">
              <label htmlFor="con-target">Target name</label>
              <input type="text" value={this.state.target} onChange={this.handleVariableChange} className="form-control form-control-sm" id="con-target" autoComplete="off"></input>
            </div>
            <div className="form-row">
              <div className="form-group col">
                <label htmlFor="con-uid">Uid</label>
                <input type="number" min="0" value={this.state.uid} onChange={this.handleVariableChange} className="form-control form-control-sm" id="con-uid" defaultoption="0" autoComplete="off" placeholder=""></input>
              </div>
              <div className="form-group col">
                <label htmlFor="con-gid">Gid</label>
                <input type="number" min="0" value={this.state.gid} onChange={this.handleVariableChange} className="form-control form-control-sm" id="con-gid" defaultoption="0" autoComplete="off" placeholder=""></input>
              </div>
              <div className="form-group col">
                <label htmlFor="con-mode">Mode</label>
                <input type="text" value={this.state.mode} onChange={this.handleVariableChange} className="form-control form-control-sm" id="con-mode" autoComplete="off" pattern={Constants.patterns.UNIX_PERMISSIONS} placeholder="e.g. 0440"></input>
              </div>
            </div>
          </form>
        </div>
      </div>
		);
	}
}