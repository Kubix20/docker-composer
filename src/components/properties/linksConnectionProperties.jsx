import React from "react";
import Properties from './properties'

export default class LinksConnectionProperties extends Properties {
  
  initializeState(){
    return {
      alias: this.selectedCell.props.alias || '',
    };
  }

  render(){
	  return (
      <div id="props_links" className="properties overflow-auto">
        <div className="m-2">
          <form>
            <div className="form-group">
              <label htmlFor="links-alias">Alias</label>
              <input type="text" value={this.state.alias} onChange={this.handleVariableChange} className="form-control" id="links-alias" autoComplete="off" placeholder=""></input>
            </div>
          </form>
        </div>
      </div>
		);
	}
}