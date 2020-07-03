import React, { Component } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus } from '@fortawesome/free-solid-svg-icons';

export default class IpamConfigEntry extends Component {
 
  render(){
	  return (
      <div>
        <div className="form-row align-middle">
          <div className="form-group col-10 my-1" />
          <div className="form-group col my-1">
             <button id={"ipam.config-delete"} onClick={(e) => this.props.onRemove(e, this.props.index)} className="btn btn-sm btn-light"><FontAwesomeIcon icon={faMinus}/></button>
          </div>
        </div>
        <div className="form-row d-flex align-items-center">
          <div className="form-group col-3 p-0 my-1">
            <label htmlFor="ipam.config-subnet">Subnet</label>
          </div>
          <div className="form-group col p-0 my-1">
             <input type="text" id="ipam.config-subnet" value={this.props.config.subnet} onChange={(e) => this.props.onChange(e, this.props.index)} onBlur={this.props.onBlur} className="form-control form-control-sm" pattern={this.props.pattern} autoComplete="off" placeholder=""></input>
          </div>
        </div>
        <hr className="my-2"/>
      </div>
		);
	}
}