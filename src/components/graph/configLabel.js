import React, { Component } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile } from '@fortawesome/free-solid-svg-icons';
import ErrorIndicator from './errorIndicator';

export default class ConfigLabel extends Component {
    
  constructor(props){
    super(props);

    this.state = {
      key: props.cell.getAttribute('name') || ''
    }
  }

  static getDerivedStateFromProps(props, currState) {
    return {
      key: props.cell.getAttribute('name') || ''
    };
  }

  shouldComponentUpdate(nextProps, nextState){
    return this.state.key !== nextState.key;
  }

  handleOnBlur = (e) => {
    e.target.setSelectionRange(0,0);
  }

  handleKeyChange = (e) => {
    this.setState({key: e.target.value });
    this.props.cell.setAttribute('name', e.target.value);
  }

  render(){
    return (
      <div className="position-relative" style={{fontSize: '12px', width: "120px"}}>
        <div className="mx-3">
          <div className="container mt-2">
            <div className="row justify-content-center"> 
              <span className="unselectable pb-1" style={{fontSize: "16px"}}><FontAwesomeIcon icon={faFile}/> Config</span>
            </div>
            <div className="row justify-content-center">
              <input type="text" value={this.state.key} onBlur={this.handleOnBlur} onChange={this.handleKeyChange} className="form-control form-control-sm transparent inputVolume p-0" style={{height: '20px', width: '80px', color: 'black', textAlign: 'center'}} id="vol-key" autoComplete="off" placeholder="(key)"></input>
            </div>
          </div>
        </div>
        <ErrorIndicator cell={this.props.cell} />
      </div>
    );
  }
}