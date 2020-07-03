import React, { Component } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDocker } from '@fortawesome/free-brands-svg-icons';

export default class ImageIcon extends Component {

  constructor(props){
    super(props);
    
    this.state = {
      error: false
    }
  }

  handleError = () => {
    this.setState({ error: true })
  }

  render(){

    let icon;
    if(!this.state.error && this.props.logoUrl && (this.props.logoUrl.small || this.props.logoUrl.large))
      icon = <img className="unselectable" onError={this.handleError} alt="icon" src={this.props.logoUrl.small || this.props.logoUrl.large} style={{width: "45px"}}/>
    else
      icon = <FontAwesomeIcon icon={faDocker}/>

	  return (
      icon
		);
	}
}