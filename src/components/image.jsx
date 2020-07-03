import React, { Component } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faInfo } from '@fortawesome/free-solid-svg-icons';
import Constants from '../constants';
import ImageIcon from './imageIcon';
const { shell } = require('electron');

export default class Image extends Component {

  constructor(props){
    super(props);
    
    this.container = React.createRef();
  }

  onDrop = (graph, evt, cell, x, y) => {
    let node = graph.addNode('service', "", { image: this.props.info.name }, graph.getDefaultParent(), x, y);
    node.info = this.props.info;
  }

  componentDidMount(){
    if(this.props.ready)
      this.dragSource = this.props.makeDraggable(this.container.current, this.props.info, this.onDrop);
  }

  openImageUrl = (e) => {
    let url = Constants.DOCKERHUB;
    if(this.props.info.source !== 'community')
      url += `_/${this.props.info.slug}`;
    else
      url += `r/${this.props.info.name}`;

    shell.openExternal(url);
  }

  render(){

	  return (
      <div key={this.props.index} id="image" className="container border-top border-bottom" ref={this.container}>
        <div className="row">
          <div className="col-3 p-1 d-flex justify-content-center align-items-center" style={{fontSize: "27px", color: "#099cec"}}>
            <div className="position-relative">
              <ImageIcon logoUrl={this.props.info.logo_url}/>
              <div onClick={this.openImageUrl} className="p-1 image-info">
                <FontAwesomeIcon icon={faInfo}/>
              </div>
            </div>
          </div>
          <div className="col-6 p-1 pr-0">
              <p className="unselectable my-1" style={{fontSize: "10px"}}>{this.props.info.source !== "community" ? "official" : this.props.info.name.split('/')[0]}</p>
              <p className="unselectable my-1 font-weight-bold" style={{fontSize: "12px"}}>{this.props.info.source !== "community" ? this.props.info.name : this.props.info.name.split('/')[1]}</p>
          </div>
          <div className="col-3 p-1 pl-0 text-right">
            <p className="unselectable text-sm text-muted" style={{fontSize: "10px"}}>
              {this.props.info.shortPopularity+" "}
              <FontAwesomeIcon icon={faThumbsUp}/>
            </p>
          </div>
        </div>
        <div className="my-2">
          <div className="mx-2 text-muted" style={{fontSize: "12px"}}>
            <p className="unselectable">{this.props.info.short_description}</p> 
          </div>
        </div>
      </div>
		);
	}
}