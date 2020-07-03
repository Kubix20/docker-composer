import React from "react";
import Properties from './properties';
import { isSet, setVariable } from '../../utils';

export default class ConfigProperties extends Properties {

  initializeState(){
    return {
      key: this.selectedCell.getAttribute('name'),
      file: this.selectedCell.props.file || '',
      external: this.selectedCell.props.external || false,
      name: this.selectedCell.props.name || ''
    };
  }

  handleExternalChange = (e) => {
    //Clear name input
    this.setState({name: ""});
    setVariable(this.selectedCell.props, 'name', "");
    
    this.handleCheckChange(e);
  }

  fileDisabled = () => {
    return isSet(this.selectedCell.props, 'external');
  }

  externalDisabled = () => {
    return isSet(this.selectedCell.props, 'file');
  }

  nameDisabled = () => {
    return !isSet(this.selectedCell.props, 'external')
  }

  render(){
	  return (
      <div id="props_ser" className="properties overflow-auto">
        <div className="m-2" style={{height: "auto"}}>
          <form ref={this.form}>
            <div className="form-group my-1">
              <label htmlFor="con-key">Key</label>
              <input type="text" value={this.state.key} ref={this.keyInput} onChange={this.handleKeyChange} onBlur={() => {this.validateKey(); this.validateForm()}} className="form-control form-control-sm" id="con-key" autoComplete="off"></input>
            </div>
            <div className="form-group my-1">
              <label htmlFor="con-file">File</label>
              <input type="text" value={this.state.file} onChange={this.handleVariableChange} disabled={this.fileDisabled()} className="form-control form-control-sm" id="con-file" autoComplete="off" placeholder="File path"></input>
            </div>
            <div className="form-check my-2">
              <input className="form-check-input" type="checkbox" checked={this.state.external} onChange={this.handleExternalChange} disabled={this.externalDisabled()} id="con-external"></input>
              <label className="form-check-label" htmlFor="con-external">
                External
              </label>
            </div>
            <div className="form-group my-1">
              <label htmlFor="con-name">Name</label>
              <input type="text" value={this.state.name} onChange={this.handleVariableChange} disabled={this.nameDisabled()} className="form-control form-control-sm" id="con-name" autoComplete="off"></input>
            </div>
          </form>
        </div>
      </div>
		);
	}
}