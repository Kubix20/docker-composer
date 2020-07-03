import React, { Component } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus } from '@fortawesome/free-solid-svg-icons';

export default class VolumeEntry extends Component {
  constructor(props){
    super(props);

    this.state = this.getDisabledInputs(this.props.object.type);
  }

  getDisabledInputs = (type) => {
    let newState = {};
    if(type === 'volume'){
      newState = {
        sourceDisabled: false,
        volumeNo_copyDisabled: false,
        bindPropagationDisabled: true,
        tmpfsSizeDisabled: true,
      };
    }
    else if(type === 'bind'){
      newState = {
        sourceDisabled: false,
        volumeNo_copyDisabled: true,
        bindPropagationDisabled: false,
        tmpfsSizeDisabled: true,
      };
    }
    else if(type === 'tmpfs'){
      newState = {
        sourceDisabled: true,
        volumeNo_copyDisabled: true,
        bindPropagationDisabled: true,
        tmpfsSizeDisabled: false,
      }
    }
    else if(type === 'npipe'){
      newState = {
        sourceDisabled: false,
        volumeNo_copyDisabled: true,
        bindPropagationDisabled: true,
        tmpfsSizeDisabled: true,
      };
    }
    return newState;
  }

  handleTypeChange = (e) => {
    const newState = this.getDisabledInputs(e.target.value);
    this.setState(newState);
    this.props.onChange(e, this.props.index, this.props.onDisabledChange, newState);
  }

  render(){
	  return (
      <div>
        <div className="form-row">
          <div className="form-group col-10">
            <select value={this.props.object.type} onChange={this.handleTypeChange} defaultoption="volume" id={this.props.label+"-type"} className="form-control form-control-sm">
              <option>volume</option>
              <option>bind</option>
              <option>tmpfs</option>
              <option>npipe</option>
            </select>
          </div>
          <div className="form-group col-md-2">
             <button id={this.props.label+"-delete"} onClick={(e) => this.props.onRemove(e, this.props.index)} className="btn btn-sm btn-light"><FontAwesomeIcon icon={faMinus}/></button>
          </div>
        </div>
        <div className="form-row align-items-center">
          <div className="form-group col">
              <input type="text" value={this.props.object.source} onChange={(e) => this.props.onChange(e, this.props.index)} className="form-control form-control-sm" id={this.props.label+"-source"} autoComplete="off" placeholder="Source" disabled={this.state.sourceDisabled}></input>
          </div>
          <div className="form-group col-1 text-center">
            :
          </div>
          <div className="form-group col">
              <input type="text" value={this.props.object.target} onChange={(e) => this.props.onChange(e, this.props.index)} className="form-control form-control-sm" id={this.props.label+"-target"} autoComplete="off" placeholder="Target"></input>
          </div>
        </div>
        <div className="form-row align-items-center mb-3">
          <div className="col-8">
            <select value={this.props.object.consistency} onChange={(e) => this.props.onChange(e, this.props.index)} defaultoption="consistent" id={this.props.label+"-consistency"} className="form-control form-control-sm">
              <option>consistent</option>
              <option>cached</option>
              <option>delegated</option>
            </select>
          </div>
          <div className="col">
            <div className="form-check mb-1">
              <input type="checkbox" checked={this.props.object.read_only} onChange={(e) => this.props.onChange(e, this.props.index)} className="form-check-input" id={this.props.label+"-read_only"}></input>
              <label className="form-check-label" htmlFor={this.props.label+"-read_only"}>Read only</label>
            </div>
          </div>
        </div>
        <div className="form-row align-items-center">
          <div className="col-4">
            <select value={this.props.object.bindPropagation} onChange={(e) => this.props.onChange(e, this.props.index)} defaultoption="rprivate" id={this.props.label+"-bind.propagation"} className="form-control form-control-sm" disabled={this.state.bindPropagationDisabled}>
              <option>rprivate</option>
              <option>private</option>
              <option>rshared</option>
              <option>shared</option>
              <option>rslave</option>
              <option>slave</option>
            </select>
          </div>
          <div className="col-4">
            <input type="text" value={this.props.object.tmpfsSize} onChange={(e) => this.props.onChange(e, this.props.index)} className="form-control form-control-sm" id={this.props.label+"-tmpfs.size"} autoComplete="off" placeholder="e.g 10mb" disabled={this.state.tmpfsSizeDisabled}></input>
          </div>
          <div className="col">
            <div className="form-check">
              <input type="checkbox" checked={this.props.object.volumeNo_copy} onChange={(e) => this.props.onChange(e, this.props.index)} className="form-check-input" id={this.props.label+"-volume.no_copy"} disabled={this.state.volumeNo_copyDisabled}></input>
              <label className="form-check-label" htmlFor={this.props.label+"-volume.no_copy"}>No copy</label>
            </div>
          </div>
        </div>
        <hr className="my-2"/>
      </div>
		);
	}
}