import React, { Component } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus } from '@fortawesome/free-solid-svg-icons';

export default class SimpleEntry extends Component {
 
  render(){
	  return (
      <div className="form-row align-middle">
        <div className="form-group col-md-10">
           <input type="text" value={this.props.entry} onChange={(e) => this.props.onChange(e, this.props.index)} onBlur={this.props.onBlur} className="form-control form-control-sm" id={this.props.label} pattern={this.props.pattern} autoComplete="off"></input>
        </div>
        <div className="form-group col-md-2">
           <button id={this.props.label+"-delete"} onClick={(e) => this.props.onRemove(e, this.props.index)} className="btn btn-sm btn-light"><FontAwesomeIcon icon={faMinus}/></button>
        </div>
      </div>
		);
	}
}