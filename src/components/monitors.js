
import React, { Component } from "react";
import Monitor from "./monitor";
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';


export default class Monitors extends Component {

  render(){
    return (
      <div className="fill" id="monitors">
        <Tabs defaultActiveKey="general" transition={false} id="monitors-tabs">
          <Tab eventKey="general" title="General">
            <div style={{height: '166px'}}>
              <Monitor stickyOffset="200" output={this.props.output}/>
            </div>
          </Tab>
          {
            Object.keys(this.props.runningServicesMap).map( key => 
              <Tab key={key} eventKey={key.toLowerCase()} title={key}>
                <div style={{height: '166px'}}>
                  <Monitor stickyOffset="200" output={this.props.runningServicesMap[key].container.logs}/>
                </div>
              </Tab>
            )
          }
        </Tabs>
      </div>
    )
  }
}

