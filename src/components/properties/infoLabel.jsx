import React, { Component } from "react";
import Constants from '../../constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
const { shell } = require('electron');

export default class InfoLabel extends Component {

	openDocs = (e) => {
	    let url = Constants.DOCKER_COMPOSE_REFERENCE_V3+`#${this.props.docsId}`;
	    shell.openExternal(url);
  	}

	render() {
		return (
			<React.Fragment>
				<label htmlFor={this.props.htmlFor}>{this.props.children}</label>
				<span className="pointer ml-1" onClick={this.openDocs} style={{ fontSize: '14px'}}><FontAwesomeIcon icon={faInfoCircle}/></span>
			</React.Fragment>
		);
	}
}