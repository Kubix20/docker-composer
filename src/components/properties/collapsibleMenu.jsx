import React, { Component } from "react";
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';

export default class CollapsibleMenu extends Component {

  render(){
	  return (
      <div className={this.props.className}>
        <Accordion>
          <Card>
            <Accordion.Toggle as={Card.Header} eventKey="0">
              {this.props.label}
            </Accordion.Toggle>
            <Accordion.Collapse eventKey="0">
              <Card.Body>
               {this.props.children}
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        </Accordion>
      </div>
		);
	}
}