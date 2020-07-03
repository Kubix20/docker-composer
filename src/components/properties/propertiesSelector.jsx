import React, { Component } from "react";
import VolumeProperties from './volumeProperties';
import ServiceProperties from './serviceProperties';
import NetworkProperties from './networkProperties';
import ConfigProperties from './configProperties';
import LinksConnectionProperties from './linksConnectionProperties';
import VolumeConnectionProperties from './volumeConnectionProperties';
import NetworkConnectionProperties from './networkConnectionProperties';
import ConfigConnectionProperties from './configConnectionProperties';

export default class PropertiesSelector extends Component {
  
  render(){
    if(this.props.display === 'service')
      return <ServiceProperties graph={this.props.graph}/>
    else if(this.props.display === 'volume')
      return <VolumeProperties graph={this.props.graph}/>
    else if(this.props.display === 'network')
      return <NetworkProperties graph={this.props.graph}/>
    else if(this.props.display === 'config' || this.props.display === 'secret')
      return <ConfigProperties graph={this.props.graph}/>
    else if(this.props.display === 'links')
      return <LinksConnectionProperties graph={this.props.graph}/>
    else if(this.props.display === 'volumes')
      return <VolumeConnectionProperties graph={this.props.graph}/>
    else if(this.props.display === 'networks')
      return <NetworkConnectionProperties graph={this.props.graph}/>
    else if(this.props.display === 'configs' || this.props.display === 'secrets')
      return <ConfigConnectionProperties graph={this.props.graph}/>
    else
      return (
        <div id="props_default" className="properties d-flex justify-content-center align-items-center">
            <p className="h6 font-bold font-weight-bold text-muted">Nothing selected</p>
        </div>
      );
	}
}