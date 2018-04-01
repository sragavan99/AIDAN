import React, {Component} from 'react';
import { render } from 'react-dom';
import ReactModal from 'react-modal';
import { Analysis } from './Analysis.jsx';
// import socketIOClient from 'socket.io-client';
// import socketIOStream from 'socket.io-stream';

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
  }

  handleDatasetChange(event) {
    console.log("Dataset changed");
    console.log(event.target.files[0].name);
    console.log(event.target.files[0].size);
    // this.setState({datasetSrc: event.target.files[0], submitEnabled: true});
    var url = window.URL.createObjectURL(event.target.files[0]);
    this.setState({datasetSrc: url, submitEnabled: true});
  }

  handleSubmit() {
    console.log("Submitted");
    // const socket = socketIOClient("http://127.0.0.1:50000");
    {/*socket.on("FromAPI", data => this.setState({ response: data }));
    socket.connect();
    var ss = require("socket.io-")
    let stream = 
    let formdata = new FormData();
    formdata.append('csvFile', this.state.datasetSrc);
    console.log(formdata);
  socket.send(formdata);*/}

    {/*const socket = socketIOClient("https://botserver.localtunnel.me");
    socket.on("connect", function () {
      console.log("connected!");
    });
    // socket.on("FromAPI", data => this.setState({ response: data }));
    socket.connect();
    socket.send("Hello World");

    var fileReader = new FileReader();
    fileReader.readAsArrayBuffer(this.state.datasetSrc);
    fileReader.onLoad = (evt) => {
      var arrayBuffer = fileReader.result;
      socket.emit('dataset', {
        name: this.state.datasetSrc.name,
        type: this.state.datasetSrc.type,
        size: this.state.datasetSrc.size,
        data: arrayBuffer
      });
      console.log(file.size);
    }
  console.log("DONE SUBMITTING");*/}

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
        <ReactModal isOpen={this.state.showChatbot} shouldCloseOnEsc={true} contentLabel="Edit" ariaHideApp={false} style={modalStyles}>
          <Analysis csvUrl={this.state.datasetSrc}/>
        </ReactModal>
      </div>
    );
  }
}