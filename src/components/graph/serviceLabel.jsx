import React, { Component } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCube, faDesktop, faThLarge } from '@fortawesome/free-solid-svg-icons';
import ErrorIndicator from './errorIndicator';
import { setVariable } from '../../utils';
import Constants from '../../constants';

export default class ServiceLabel extends Component {
    
  constructor(props){
    super(props);

    this.state = ServiceLabel.initializeState(props);
    this.imageInput = React.createRef();
    this.tagInput = React.createRef();
  }

  static initializeState(props){
    const state = {
      key: props.cell.getAttribute('name') || '',
      image: props.cell.props.image ? props.cell.props.image.split(':')[0] || '': '',
      tag: props.cell.props.image ? props.cell.props.image.split(':')[1] || '': '',
      container: props.cell.container,
    }

    return state;
  }

  static getDerivedStateFromProps(props, currState) {
    return ServiceLabel.initializeState(props);
  }

  shouldComponentUpdate(nextProps, nextState){

    const diffState = JSON.stringify(this.state) !== JSON.stringify(nextState);
    const cellUpdated = nextProps.cell.update;

    return cellUpdated || diffState; 
  }

  componentDidUpdate(prevProps) {
    this.props.cell.update = false;
  }

  handleBlur = (e) => {
    e.target.setSelectionRange(0,0);
    if(this.props.graph)
      this.props.graph.isValidKey(this.props.cell);
  }

  handleKeyChange = (e) => {
    this.setState({key: e.target.value});
    this.props.cell.setAttribute('name', e.target.value);
  }

  handleImageChange = (e) => {
    const imageInput = this.imageInput.current;
    const tagInput = this.tagInput.current;

    let image = '';
    if(tagInput.value !== "")
         image = `${imageInput.value}:${tagInput.value}`;
      else
         image = imageInput.value;

    this.setState({image: imageInput.value, tag: tagInput.value});
    setVariable(this.props.cell.props, 'image', image);
  }

  render(){
    
    let ports = [];
    if(this.props.cell.props.ports)
      ports = this.props.cell.props.ports.map((p,i) => {
        if(p.target)
          return (
            <div key={i} className="row d-flex align-items-center my-1">
              <div className="col-5">
                { p.target || '' }
              </div>
              <div className="col-2">
                :
              </div>
              <div className="col-5">
                { p.published || 'auto'}
              </div>
            </div>
          );
        else
          return (
            <div key={i}/>
          )
      });

    return (
      <div className="position-relative" style={{fontSize: '12px', width: "250px"}}>
        <div className="mx-3">
          <div className="container mt-2">
            <div className="row align-items-center">
              <div className="position-relative col-1 px-0">
                <div style={{height: "20px", width: "20px", borderRadius: "10px", backgroundColor: Constants.colors[this.props.cell.container.status] }}/>
                <span style={{position: 'absolute', width: '100px', left: 'calc(50% - 50px)', textAlign: 'center', fontSize: '10px', color: Constants.colors[this.props.cell.container.status]}}>{this.props.cell.container.status}</span>
              </div>
              <div className="col pr-0">
                <span className="unselectable pb-1" style={{fontSize: "16px"}}><FontAwesomeIcon icon={faCube}/>  Service</span>
              </div>
              <div className="col pl-0">
                <input type="text" value={this.state.key} onChange={this.handleKeyChange} onBlur={this.handleBlur} className="form-control form-control-sm transparent p-0" style={{height: '20px'}} autoComplete="off" placeholder="(key)"></input>
              </div>
            </div>
          </div>
          <div style={{height: '155px'}}/>
            <div className="force-wrap">
            <form>
              <div className="form-group mb-2">
                <label className="draggable mb-1 pl-2" htmlFor="image">Image</label>
                <input type="text" ref={this.imageInput} value={this.state.image} onChange={this.handleImageChange} onBlur={this.handleBlur} className="form-control form-control-sm transparent" autoComplete="off" placeholder="e.g. node"></input>
              </div>
              <div className="form-group mb-2">
                <label className="draggable mb-1 pl-2" htmlFor="tag">Tag</label>
                <input type="text" ref={this.tagInput} defaultValue={this.state.tag} onChange={this.handleImageChange} onBlur={this.handleBlur} className="form-control form-control-sm transparent" autoComplete="off" placeholder="latest"></input>
              </div>
            </form>
            <div className="container mt-3 text-center">
              <div className="row">
                <div className="col-5 pr-0">  
                  <span> <FontAwesomeIcon icon={faThLarge}/> Container</span>
                </div>
                <div className="col-2">
                </div>
                <div className="col-5 pl-0">
                  <span> <FontAwesomeIcon icon={faDesktop}/> Host</span>
                </div>
              </div>
              {
                ports
              }
            </div>
          </div>
          <ErrorIndicator cell={this.props.cell} />
        </div>
      </div>
    );
  }
}