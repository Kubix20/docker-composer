import React, { Component } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloud } from '@fortawesome/free-solid-svg-icons';
import ErrorIndicator from './errorIndicator';

export default class NetworkLabel extends Component {
    
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
      <div className="position-relative" style={{fontSize: '12px', width: "140px"}}>
        <div className="mx-3">
          <div className="container mt-2">
            <div className="row justify-content-center"> 
              <span className="unselectable pb-1" style={{fontSize: "16px"}}><FontAwesomeIcon icon={faCloud}/> Network</span>
            </div>
            <div className="row justify-content-center">
              <input type="text" value={this.state.key} onBlur={this.handleOnBlur} onChange={this.handleKeyChange} className="form-control form-control-sm transparent inputVolume p-0" style={{height: '20px', width: '100px', color: 'black', textAlign: 'center'}} autoComplete="off" placeholder="(key)"></input>
            </div>
          </div>
        </div>
        <ErrorIndicator cell={this.props.cell} />
      </div>
    );
  }
}