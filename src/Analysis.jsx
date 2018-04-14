import React, {Component} from 'react';
import { render } from 'react-dom';
import Plot from 'react-plotly.js';
import axios from 'axios';

export class Analysis extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
          dataLoaded: false,
          mean: -1,
          processes: [],
          data: [],
          layout: {},
          frames: [],
          config: {}
      }
      this.headings = [];
      this.rows = [];
      this.currentMessage = "";
      this.processMessage = this.processMessage.bind(this);
      this.deleteLastCommand = this.deleteLastCommand.bind(this);
      this.getResults = this.getResults.bind(this);
      this.getResults();
    }

    getResults() {
        console.log("FETCHING RESULTS");
        axios.get('http://132.148.155.201:50000').then( response => {
            /*console.log('this is a test message');
            console.log('hi: ' + response.data);*/
            console.log(response.data["count"]);
            var count = response.data["count"];
            var temp = this.state.processes.slice();
            for (var i = 0; i < count; i++) {
                temp.push(JSON.parse(response.data[String(i)]));
                console.log(response.data[String(i)]);
                console.log(JSON.parse(response.data[String(i)]));
            }
            this.setState({processes: temp});
        });
        setTimeout(this.getResults, 1000);
    }

    deleteLastCommand() {
        var temp = this.state.processes.slice(0);
        temp.splice(-1);
        this.setState({processes: temp});
    }

    processMessage(message) {
        console.log(message);
    }
  
    render() {
        const attributes = {
            src: "./src/chatbot.html",
            width: "500",
            height: "600",
            frameBorder: 1, // show frame border just for fun... 
        };
        // the postMessage data you want to send to your iframe 
        // it will be send after the iframe has loaded 
        const postMessageData = "hello iframe";
 
        // parent received a message from iframe 
        const onReceiveMessage = (event) => {
            console.log("onReceiveMessage");
        };
 
        // iframe has loaded 
        const onReady = () => {
            console.log("onReady");
        };
      return (
        <div className="container-fluid">
          <div className="jumbotron text-center" style={{'background-color': '#cce6ff'}}>
            <h1>A.I.D.A.N.</h1>
          </div>
        <div className="row">
          <div className="col-md-4">
            <iframe id='chatbot' src='./src/chatbot3.html' width='500' height='570' align='left'/>
          </div>
          {/*<div>
              <p align='right'> "Stat: {this.state.mean}" </p>
          </div>*/}

          {/* DELETE BUTTON */}
          {/*<div className="col-sm-4">
              <button onClick={this.deleteLastCommand} disabled={this.state.processes.length == 0}>
                Delete last command
              </button>
        </div>*/}
          {/*<div>
              <Plot
                data={this.state.data}
                layout={this.state.layout}
                frames={this.state.frames}
                config={this.state.config}
                onInitialized={(figure) => this.setState(figure)}
                onUpdate={(figure) => this.setState(figure)}
              />
          </div>*/}
          <div className="list-group col-md-8" style={{'overflowY':'auto', 'height':'570px'}}>
            {this.state.processes.map((process, i) => (
                <a href="#" className="list-group-item flex-column align-items-start" style={{'background-color': '#f2f2f2'}}>
                    <div key={'text'+i}>
                        <p align='left' className='text-dark'> {process.command} </p>
                        <p align='right' className='text-dark'> {process.response} </p>
                    </div>
                    <div key={'plot'+i} hidden={!process.plotted} align='right'>
                        <Plot
                            data={process.data}
                            layout={process.layout}
                            onInitialized={(figure) => this.setState(figure)}
                            onUpdate={(figure) => this.setState(figure)}
                        />
                    </div>
                </a>
            ))}
            </div>
        </div>
        </div>
      );
    }
  }