import React from "react";
import Properties from './properties';
import MultipleProperties from './multipleProperties';
import SimpleEntry from './entries/simpleEntry';

export default class NetworkConnectionProperties extends Properties {
  
  initializeState(){
    return {
      aliases: this.selectedCell.props.aliases || [],
      ipv4_address: this.selectedCell.props.ipv4_address || '',
      ipv6_address: this.selectedCell.props.ipv6_address || ''
    };
  }

  handlePropsChanged = (e, index) => {
    let copy = JSON.parse(JSON.stringify(this.state.aliases));
    copy[index] = e.target.value;
    this.setState({aliases: copy});
    
    if(!this.selectedCell.props.aliases)
      this.selectedCell.props.aliases = [];
    
    this.selectedCell.props.aliases = copy;
  }

  handleRemove = (e, index) => {
    e.preventDefault();
    this.state.aliases.splice(index, 1);
    if(this.state.aliases.length === 0)
      delete this.selectedCell.props.aliases;
    this.setState({aliases: this.state.aliases});
  }

  handleAdd = (e) => {
    e.preventDefault();
    const lastIndex = this.state.aliases.length-1;
    const last = this.state.aliases[lastIndex];
    if(lastIndex === -1 || last !== '')
      this.setState({aliases: [...this.state.aliases, '']});
  }

  render(){
	  return (
      <div id="props_net" className="properties overflow-auto">
        <div className="m-2">
          <form>
            <div className="form-group mt-2">
              <label htmlFor="nets_ipv4_address">Ipv4 Address</label>
              <input type="text" value={this.state.ipv4_address} onChange={this.handleVariableChange} className="form-control form-control-sm" id="nets-ipv4_address" autoComplete="off" placeholder=""></input>
            </div>
            <div className="form-group">
              <label htmlFor="nets_ipv6">Ipv6 Address</label>
              <input type="text" value={this.state.ipv6_address} onChange={this.handleVariableChange} className="form-control form-control-sm" id="nets-ipv6_address" autoComplete="off" placeholder=""></input>
            </div>
            <MultipleProperties id="aliases" label="Aliases" onAdd={this.handleAdd}>
              {
                this.state.aliases.map((alias,i) => (
                  <SimpleEntry key={i} label="environment" entry={alias} index={i} onChange={this.handlePropsChanged} onRemove={this.handleRemove}></SimpleEntry>
                ))
              }
            </MultipleProperties>
          </form>
        </div>
      </div>
		);
	}
}