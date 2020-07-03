import React, { Component } from "react";
import { safeDump } from 'js-yaml';
import Constants from '../constants';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/DropdownButton';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder, faCogs, faPlay, faStop, faSave, faFileUpload, faArrowDown } from '@fortawesome/free-solid-svg-icons';

export default class ToolBar extends Component {

  constructor(props) {
    super(props);

    this.shortSyntax = React.createRef();
    this.commandSyntax = React.createRef();
    this.state = {
      show: false,
      settings: {
        outputVersion: '3.6',
        shortSyntax: 'Prefer short',
        commandSyntax: 'As string',
        keyValuesSyntax: 'As array'
      },
      startDisabled: false,
    };
  }

  handleShow = () => {
    this.initSettings = JSON.parse(JSON.stringify(this.state.settings));
    this.setState({show: true});
  }

  handleDiscard = () => {
    this.setState({ settings: this.initSettings, show: false });
  }

  handleSave = () => {
    this.setState({  show: false });
  }

  handleSettingsChange = (e) => {
    let settings = {...this.state.settings}
    settings[e.target.name] = e.target.value;
    this.setState({ settings: settings });
  }

  handleExport = (e) => {

    const shortSyntax = this.state.settings.shortSyntax === 'Prefer short';
    const commandSyntax = this.state.settings.commandSyntax === 'As string';
    const keyValuesSyntax = this.state.settings.keyValuesSyntax === 'As array';
    const json = this.props.graph.modelToJson(this.state.settings.outputVersion, shortSyntax, commandSyntax, keyValuesSyntax);
    const res = safeDump(json);
    console.log(res);

    this.props.openSaveDialog(res);
  }

  handleImport = (e) => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.style.display = 'none';

    input.onchange = (evt) => {
      const file = evt.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = (evt) => {
            
        };
        reader.onerror = (evt) => {
           console.log("error reading file");
        };
      }
    };
    document.body.appendChild(input);
    input.click();
  }

  handleStart = () => {
    this.props.onStart();
    this.setState({ startDisabled: true });
  }

  render(){
	  return (
      <div id="toolbar">
        <nav className="navbar navbar-expand navbar-light bg-light">
          <h4 className="navbar-brand mx-4 my-2 unselectable">Docker Composer</h4>
          <div style={{height: "26px", width: "26px", borderRadius: "13px", backgroundColor: Constants.colors[this.props.runningState] }}/>

          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ml-5 mr-auto">
              <li className="nav-item">
                <button onClick={this.handleStart} className="btn btn-sm btn-primary my-2 mx-1" disabled={this.props.runningState !== 'off'}><FontAwesomeIcon icon={faPlay}/> Start</button>
              </li>
              <li className="nav-item">
                <button onClick={this.props.onStop} className="btn btn-sm btn-primary my-2 mx-1" disabled={this.props.runningState === 'off'}><FontAwesomeIcon icon={faStop}/> Stop</button>
              </li>
              <li className="nav-item">
                <button onClick={this.props.onDown} className="btn btn-sm btn-danger my-2 mx-1" disabled={!this.props.tmpFileCreated}><FontAwesomeIcon icon={faArrowDown}/> Down</button>
              </li>
              <li className="nav-item">
                <div className="fill d-flex align-items-center" style={{ width: '300px' }}>
                  <span title={this.props.cwd} className="ellipsis text-muted ml-1" style={{ height: '20px' }}>{ this.props.cwd }</span>
                </div>
              </li>
            </ul>
            <div className="mr-2">
              <ButtonGroup size="sm">
                <Button onClick={this.props.onLoad}><FontAwesomeIcon icon={faFileUpload}/> Open</Button>
                <DropdownButton as={ButtonGroup} title="" id="open_dropdown">
                  <Dropdown.Item onClick={this.props.onImport} eventKey="1">Import</Dropdown.Item>
                </DropdownButton>
              </ButtonGroup>
            </div>
            <div className="mr-2">
              <ButtonGroup size="sm">
                <Button onClick={this.props.onSave}><FontAwesomeIcon icon={faSave}/> Save</Button>
                <DropdownButton as={ButtonGroup} title="" id="save_dropdown">
                  <Dropdown.Item onClick={this.handleExport} eventKey="1">Export</Dropdown.Item>
                </DropdownButton>
              </ButtonGroup>
            </div>
            <button onClick={this.handleShow} className="btn btn-light btn-sm my-2"><FontAwesomeIcon icon={faCogs}/> Settings</button>
          </div>
        </nav>
        <Modal show={this.state.show} onHide={this.handleDiscard} centered>
          <Modal.Header closeButton>
            <Modal.Title>Settings</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
              <div className="form-group">
                <label htmlFor="cwd-selector">Working Directory</label>
                <div id="cwd-selector" className="input-group">
                  <input disabled type="text" value={this.props.cwd} className="form-control"></input>
                  <div onClick={this.props.updateCwd} className="input-group-append pointer">
                    <span className="input-group-text"><FontAwesomeIcon icon={faFolder}/></span>
                  </div>
                </div>
              </div>
              <div className="form-inline form-group">
                <label className="mr-2" htmlFor="output-syntax-select">Output version</label>
                <select name="outputVersion" value={ this.state.settings.outputVersion} onChange={this.handleSettingsChange} id="output-version-select" className="form-control">
                  {
                    Constants.versions.map((v,i) => <option key={i}>{v}</option>)
                  }
                </select>
              </div>
              <label htmlFor="output-syntax-select">Output syntax</label>
              <select name="shortSyntax" value={ this.state.settings.shortSyntax} onChange={this.handleSettingsChange} id="output-syntax-select" className="form-control">
                <option>Prefer short</option>
                <option>Always long</option>
              </select>
              <label htmlFor="output-array-select">Output command variables (e.g. command)</label>
              <select name="commandSyntax" value={ this.state.settings.commandSyntax} onChange={this.handleSettingsChange} id="output-array-select" className="form-control">
                <option>As string</option>
                <option>As array</option>
              </select>
              <label htmlFor="output-array-select">Output key-values (e.g. environment)</label>
              <select name="keyValuesSyntax" value={ this.state.settings.keyValuesSyntax} onChange={this.handleSettingsChange} id="output-keyvalues-select" className="form-control">
                <option>As array</option>
                <option>As dictionary</option>
              </select>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <button className="btn btn-secondary" onClick={this.handleDiscard}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={this.handleSave}>
              Save Changes
            </button>
          </Modal.Footer>
        </Modal>
      </div>
		);
	}
}

// <li className="nav-item">
//   <button onClick={this.props.onRestart} className="btn btn-sm btn-primary my-2 mx-1"><FontAwesomeIcon icon={faSync}/> Restart</button>
// </li>