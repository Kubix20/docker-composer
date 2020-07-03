import React, { Component } from "react";
import ImagePallete from './imagePalette';

export default class SideBar extends Component {
  constructor(props){
    super(props);

    this.console = React.createRef();
  }

  componentDidUpdate(prevProps){
    if(this.console.current){
      if(this.console.current.scrollHeight > this.console.current.clientHeight){
        if(Math.abs(this.console.current.scrollTop - this.console.current.scrollHeight) < 160)
          this.console.current.scrollTop = this.console.current.scrollHeight;
      }
      else
        this.console.current.scrollTop = this.console.current.scrollHeight;
    }
  }

  render(){
	  return (
      <div id="sidebar" className="fill mt-2">
        <ImagePallete ready={this.props.isReady} makeDraggable={this.props.makeDraggable}/>
      </div>
		);
	}
}
