import React, { Component } from "react";
import { leafSelect, setVariable, getStateVariable, getTargetValue } from '../../utils';

export default class Properties extends Component {

  constructor(props){
    super(props);

    this.keyInput = React.createRef();
    this.selectedCell = this.props.graph.getSelectionCell();
    this.form = React.createRef();
    this.state = this.initializeState();
  }

  componentDidMount(){
    this.validateKey();
  }

  initializeState(){
    return {};
  }

  validateKey = (e) => {
    if(this.keyInput.current)
      this.keyInput.current.setCustomValidity(this.props.graph.isValidKey(this.selectedCell));
  }

  validateForm = () => {
    if(!this.form.current)
      return;

    const errors = Array.from(this.form.current.querySelectorAll(':invalid'));
    const summary = errors.map(e => {
      if(e.getAttribute('pattern')){
        return `${e.id.split('-')[1]}: ${e.validationMessage || 'Invalid value'}`
      }
      else
        return null;
    }
    ).join('\n');

    // console.log(summary);
    if(this.selectedCell.errors !== summary){
      this.selectedCell.errors.others = summary;
      this.props.graph.updateView();
    }
  }

  componentDidUpdate(prevProps) {
    const selectedCell = this.props.graph.getSelectionCell();
    if(selectedCell === undefined || selectedCell.id === this.selectedCell.id)
      return;

    this.selectedCell = selectedCell;
    this.setState(this.initializeState());
  }

  handleKeyChange = (e) => {
    this.setState({key: e.target.value});
    this.selectedCell.setAttribute('name', e.target.value);
  }

  handleVariableChange = (e) => {
    const value = getTargetValue(e.target);
    const path = e.target.id.split('-')[1];
    this.setState({[getStateVariable(path)]: value});
    setVariable(this.selectedCell.props, path, value, e.target.getAttribute('defaultoption'));
  }

  handleVariableChangeAlt = (e) => {
    const value = getTargetValue(e.target);
    const path = e.target.id.split('-')[1];
    setVariable(this.selectedCell.props, path, value, e.target.getAttribute('defaultoption'));
  }

  handleCheckChange = (e) => {
    const path = e.target.id.split('-')[1];
    this.setState({[getStateVariable(path)]: e.target.checked});
    setVariable(this.selectedCell.props, path, e.target.checked);
  }

  canAdd = (variable, last) => {
    return true;
  }

  addEntry = (variable) => {}

  setMap(array){
    if(!array)
      return undefined;

    return array.map( o => {
      if(o)
        return {
          key: o.key || '',
          value: o.value || ''
        };
      else
        return { key: '', value: '' };
    });
  }

  handleRemove = (e, index) => {
    e.preventDefault();
    console.log(index);
    const path = e.currentTarget.id.split('-')[0];
    const stateVariable = getStateVariable(path);
    let copy = JSON.parse(JSON.stringify(this.state[stateVariable]));
    copy.splice(index, 1);
    
    let prop;
    if((prop = leafSelect(this.selectedCell.props, path)))
      prop.splice(index, 1);

    if(copy.length === 0)
      setVariable(this.selectedCell.props, path, [], []);

    this.setState({[stateVariable]: copy});

    // Update and resize cell
    if(path === 'ports')
      this.props.graph.updateView(this.selectedCell, true);
  }

  handleAdd = (e) => {
    e.preventDefault();
    const path = e.currentTarget.id.split('-')[0];
    const stateVariable = getStateVariable(path);
    const lastIndex = this.state[stateVariable].length-1;
    const last = this.state[stateVariable][lastIndex];
    if(lastIndex === -1 || this.canAdd(stateVariable, last))
      this.addEntry(stateVariable);
  }

  handlePropsChanged = (e, index, constraintHandler, constraints) => {
    const variables = e.target.id.split('-');
    const stateVariable = getStateVariable(variables[0]);
    const value = getTargetValue(e.target);
    
    // Set as array if prop is undefined
    if(!leafSelect(this.selectedCell.props, variables[0]))
      setVariable(this.selectedCell.props, variables[0], [])

    let prop = leafSelect(this.selectedCell.props, variables[0]);
    let copy = JSON.parse(JSON.stringify(this.state[stateVariable]));
    
    // Check if variable is an object
    if(variables.length === 1){
      prop[index] = value;
      copy[index] = value;
    }
    else{
      if(!prop[index])
        prop[index] = {};

      setVariable(prop[index], variables[1], value, e.target.getAttribute('defaultoption'));
      copy[index][getStateVariable(variables[1])] = value;
    }

    if(constraintHandler)
      constraintHandler(prop[index], copy[index], constraints);

    this.setState({[stateVariable]: copy});
  }

}