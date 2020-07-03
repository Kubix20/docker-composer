import React, { Component } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { debounce } from 'lodash';
import InfiniteScroll from 'react-infinite-scroller';
import Image from './image';
import Constants from '../constants';

export default class ImagePallete extends Component {
  
  constructor(props){
    super(props);

    this.currentPage = 0;
    this.hasMore = {
      official: true,
      community: true
    }

    this.itemsContainer = React.createRef();

    this.state = {
      searchTerm: '',
      hasMoreItems: true,
      images: []
    };

    this.fetchImagesDebounced = debounce(() => this.fetchImages(true), 200);
    this.fetchImages();
  }

  setShortPopularity = (summary) => {
    const popularity = summary.popularity;
    
    let mult = (''+popularity).length / 3.0;
    mult = mult % 1 === 0 ? mult-1 : Math.floor(mult);
    let short = popularity;
    if(mult > 0)
      short = Math.floor(popularity / Math.pow(1000, mult)) + Constants.multipliers[mult];
    
    summary.shortPopularity = short;
  }

  fetchImages = (clear = false) => {

    let nextPage = this.currentPage;
    if(clear){
      this.hasMore.official = true;
      this.hasMore.community = true;
      nextPage = 0;
    }

    nextPage++;

    let opts = {
      params: {
        page: nextPage,
        page_size: 15,
        type: 'image',
      }
    };

    if(this.state.searchTerm !== ''){
      opts.params.q = this.state.searchTerm;
    }

    let communityOpts = JSON.parse(JSON.stringify(opts));
    communityOpts.params.source = 'community';

    let requests = [];
    let toUpdate = []
    if(this.hasMore.official){
      requests.push(axios.get(Constants.DOCKERHUB_SEARCH, opts));
      toUpdate.push('official');
    }

    if(this.hasMore.community){
      requests.push(axios.get(Constants.DOCKERHUB_SEARCH, communityOpts));
      toUpdate.push('community');
    }

    axios.all(requests)
    .then(axios.spread((...responses) => {
      let total = responses.map((r,i) => {
        let summaries = (r.data.summaries || []);

        // Filter out certified images
        // if(toUpdate[i] === 'official')
        //   summaries = summaries.filter((summary) => summary.source !== 'publisher')
        // console.log(summaries);
        summaries.forEach( s => this.setShortPopularity(s) );

        return summaries;
      }).reduce((acc, r) => acc.concat(r), []);
     
      responses.forEach((r,i) => {
        if(r.data.next === "")
          this.hasMore[toUpdate[i]] = false
      });

      total.sort((a,b) => b.popularity-a.popularity);
      let res = [];
      if(clear){
        nextPage = 1;
        res = total;
      }
      else
        res = [...this.state.images, ...total];

      // (Re)sort all by popularity
      // res.sort((a,b) => b.popularity-a.popularity);
      
      this.currentPage = nextPage;
      this.setState({
        hasMoreItems: this.hasMore.official || this.hasMore.community,
        images: res
      }, () => { if(clear) this.itemsContainer.current.scrollTop = 0 });
    }));
  }

  handleSearchChange = (e) => {
    // this.state.searchTerm = e.target.value;
    this.setState({searchTerm: e.target.value});
    this.fetchImagesDebounced();
  }

  render(){

    const loader = 
      <div key={0} className="d-flex flex-column justify-content-center align-items-center" style={{height: "100%"}}>
        <div className="my-2 spinner-border spinner-border-sm text-primary"></div>
      </div>;

    let content;
    if(!this.state.hasMoreItems && this.state.images.length === 0)
      content =
        <div className="d-flex flex-column justify-content-center align-items-center" style={{height: "100%"}}>
          <p className="text-muted">No matches :(</p>
        </div>;
    else
      content = 
        <InfiniteScroll
          pageStart={0}
          loadMore={() => {this.fetchImages()}}
          hasMore={this.state.hasMoreItems}
          initialLoad={false}
          loader={loader}
          useWindow={false}>

          {
            this.state.images.map((image, i) => (
              <Image index={i} ready={this.props.ready} makeDraggable={this.props.makeDraggable} key={i} info={image}></Image>
            ))
          }
             
        </InfiniteScroll>;

    return (
      <React.Fragment>
        <div id="image-palette">
          <div ref={this.itemsContainer} id="image-palette-items">
            {content}
          </div>
          <div className="input-group">
            <input type="text" value={this.state.searchTerm} onChange={this.handleSearchChange} className="form-control form-control-sm" id="imageSearch" autoComplete="off" placeholder="Search image"></input>
            <div className="input-group-append">
              <span className="input-group-text"><FontAwesomeIcon icon={faSearch}/></span>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

// style={{ height: 'calc(100% - 31px)', overflowY: 'scroll'}}
