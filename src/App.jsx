import React, {Component} from 'react';
import { render } from 'react-dom';
import ReactModal from 'react-modal';
import { Analysis } from './Analysis.jsx';
import axios from 'axios';

const modalStyles = {
  content : {
      position: 'absolute',
      top: '0px',
      left: '0px',
      right: '0px',
      bottom: '0px',
  },
  overlay : {
      backgroundColor: 'rgba(0, 0, 0, 0.5)'
  }
};

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showChatbot: false,
      datasetSrc: "",
      submitEnabled: false
    };
    this.handleDatasetChange = this.handleDatasetChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSubmitDefault = this.handleSubmitDefault.bind(this);
  }

  handleDatasetChange(event) {
    console.log("Dataset changed");
    console.log(event.target.files[0].name);
    console.log(event.target.files[0].size);
    this.setState({datasetSrc: event.target.files[0], submitEnabled: true});
  }

  handleSubmit() {
    console.log("Submitted");
    var formData = new FormData();
    formData.append("csvFile", this.state.datasetSrc);

    window.uploadToAzure(this.state.datasetSrc);

    console.log(this.state.datasetSrc);
    var bodyParams = this.state.datasetSrc.name + new Array(994 - this.state.datasetSrc.name.length).join(':');
    setTimeout(axios.post('http://132.148.155.201:50000', {'Upload':bodyParams}, {
      headers: {
        'Content-Type': 'text/plain'
      }
    }).then(response => {
      console.log("POST SUCCESSFUL");
      console.log(response);
    }), 2000);

    this.setState({showChatbot: true});
  }

  handleSubmitDefault() {
    console.log("Submitted default");
    var bodyParams = "pima-indians-diabetes.csv" + new Array(969).join(':');
    setTimeout(axios.post('http://132.148.155.201:50000', {'Upload':bodyParams}, {
      headers: {
        'Content-Type': 'text/plain'
      }
    }).then(response => {
      console.log("POST SUCCESSFUL");
      console.log(response);
    }), 2000);

    this.setState({showChatbot: true});
  }

  render() {
    return (
      <div className="container-fluid">
        <div className="text-center">
          <img src="/src/logo.png"/>
        </div>
        <div className="text-center">
          <p>Please upload your dataset in .csv format here:</p>
        </div>
        <div className="text-center">
          <input type="file" name="dataset" id="data" accept=".csv" onChange={(event) => this.handleDatasetChange(event)}/>
        </div>
        <br/>
        <div className="text-center">
          <button className = "btn btn-success btn-lg" disabled = {!this.state.submitEnabled} onClick={this.handleSubmit}>Start talking to Aidan!</button> 
        </div>
        <div>
          <p> "  " </p>
        </div>
        <div className="text-center">
          <button className = "btn btn-success" onClick={this.handleSubmitDefault}>Or start with our sample csv file</button>
        </div>
        <div className="text-center">
          <a href="https://github.com/mpsenka21/AIDAN/blob/master/pima-indians-diabetes.csv" className="text-center">View sample csv here</a>
        </div>
        <ReactModal isOpen={this.state.showChatbot} shouldCloseOnEsc={true} contentLabel="Edit" ariaHideApp={false} style={modalStyles}>
          <Analysis csvUrl={this.state.datasetSrc}/>
        </ReactModal>
      </div>
    );
  }
}