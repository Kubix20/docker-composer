import React, { Component } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { getErrorSummary } from '../../utils';

export default class ErrorIndicator extends Component {
	
	render(){
		const errors = getErrorSummary(this.props.cell.errors);

		// console.log(errors);
		
		return (
			<React.Fragment>
			{
	        	errors !== '' &&
	          		<div title={errors} className="error"><FontAwesomeIcon icon={faExclamationTriangle}/></div>  
	      	}
	      	</React.Fragment>
      	);
	}

}