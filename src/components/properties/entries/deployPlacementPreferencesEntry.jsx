import React, { Component } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus } from '@fortawesome/free-solid-svg-icons';

export default class DeployPlacementPreferencesEntry extends Component {
 
  render(){
	  return (
      <div>
        <div className="form-row align-middle">
          <div className="form-group col-10 my-1" />
          <div className="form-group col my-1">
             <button id={"deploy.placement.preferences-delete"} onClick={(e) => this.props.onRemove(e, this.props.index)} className="btn btn-sm btn-light"><FontAwesomeIcon icon={faMinus}/></button>
          </div>
        </div>
        <div className="form-row d-flex align-items-center">
          <div className="form-group col-3 p-0 my-1">
            <label htmlFor="deploy.placement.preferences-spread">Spread</label>
          </div>
          <div className="form-group col p-0 my-1">
             <input type="text" id="deploy.placement.preferences-spread" value={this.props.object.spread} onChange={(e) => this.props.onChange(e, this.props.index)} onBlur={this.props.onBlur} className="form-control form-control-sm" pattern={this.props.pattern} autoComplete="off"></input>
          </div>
        </div>
        <hr className="my-2"/>
      </div>
		);
	}
}