import React, { Component } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

export default class MultipleProperties extends Component {
  
  render(){
	  return (
      <div className="mt-2">
        <label htmlFor={this.props.id+"-container"}>{this.props.label}</label>
          {this.props.children}
        <div>
          <button id={this.props.id+"-add"} onClick={(e) => this.props.onAdd(e)} className="btn btn-sm btn-secondary" style={{width: "100%"}}><FontAwesomeIcon icon={faPlus}/> Add variable</button> 
        </div>
      </div>
		);
	}
}