import React, { Component } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus } from '@fortawesome/free-solid-svg-icons';

export default class PortEntry extends Component {

  constructor(props){
    super(props);

    this.state = {
      publishedDisabled: this.props.port.target === "",
    };
  }

  handleTargetChange = (e) => {
    const newState = {
      publishedDisabled: e.target.value === "" 
    };
    this.setState(newState);
    this.props.onChange(e, this.props.index, this.props.onDisabledChange, newState);
  }

  handlePublishedChange = (e) => {
    this.props.onChange(e, this.props.index, this.props.onDisabledChange, this.state);
  }

  handleChange = (e) => {
    this.props.onChange(e, this.props.index);
  }

  render(){
	  return (
      <React.Fragment>
        <div className="form-row">
          <div className="form-group col">
            <select id="ports-protocol" value={this.props.port.protocol} onChange={this.handleChange} defaultoption="TCP" className="form-control form-control-sm">
              <option>TCP</option>
              <option>UDP</option>
            </select>
          </div>
          <div className="form-group col">
            <select id="ports-mode" value={this.props.port.mode} onChange={this.handleChange} defaultoption="host" className="form-control form-control-sm">
              <option>host</option>
              <option>ingress</option>
            </select>
          </div>
          <div className="form-group d-flex col-2">
              <button id="ports-delete" onClick={(e) => this.props.onRemove(e, this.props.index)} className="btn btn-sm btn-light"><FontAwesomeIcon icon={faMinus}/></button>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group col-6 mb-1 pr-0">
            <input type="text" value={this.props.port.published} onChange={this.handlePublishedChange} className="form-control form-control-sm" id="ports-published" autoComplete="off" placeholder="Host" disabled={this.state.publishedDisabled}></input>
          </div>
          <div className="col-1 text-center mb-1 p-0">:</div>
          <div className="form-group col mb-1 pl-0">
            <input type="text" value={this.props.port.target} onChange={this.handleTargetChange} className="form-control form-control-sm" id="ports-target" autoComplete="off" placeholder="Container"></input>
          </div>
        </div>
        <hr className="my-2"/>
      </React.Fragment>
		);
	}
}