import React, { Component } from "react";

export default class Monitor extends Component {
  constructor(props) {
    super(props);

    this.follow = true;
    this.stickyOffset = props.stickyOffset || 200;
    this.console = React.createRef();
  }

  componentDidUpdate(prevProps) {
    const current = this.console.current;
    
    // If scroll bar is active
    if (current.scrollHeight > current.clientHeight) {
      if (this.follow){
        current.scrollTop = current.scrollHeight;
      }
    }
  }

  handleScroll = (e) => {
    const current = this.console.current;
    if(Math.abs(current.scrollTop - current.scrollHeight) < this.stickyOffset)
      this.follow = true;
    else
      this.follow = false;
  }

  render(){
    return (
      <div ref={this.console} onScroll={this.handleScroll} className="monitor fill">
        <p className="px-1">
          {this.props.output}
        </p>
      </div>
    )
  }
}