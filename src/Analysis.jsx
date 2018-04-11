import React, {Component} from 'react';
import { render } from 'react-dom';
import $ from 'jquery';
import Plot from 'react-plotly.js';
import SimpleLinearRegression from 'ml-regression-simple-linear';

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
      this.jStat = require('jStat').jStat;
      this.getCsv = this.getCsv.bind(this);
      this.successFunction = this.successFunction.bind(this);
      this.processMessage = this.processMessage.bind(this);
      this.chatbotCommands = this.chatbotCommands.bind(this);
      this.deleteLastCommand = this.deleteLastCommand.bind(this);
      this.getMessage = this.getMessage.bind(this);
    }

    componentDidMount() {
        this.getCsv();
    }

    getMessage() {
        console.log("MESSAGE");
        if (this.currentMessage != document.getElementById('chatbot').contentWindow.botmessage) {
            console.log(document.getElementById('chatbot'));
            this.currentMessage = document.getElementById('chatbot').contentWindow.botmessage;
            console.log(this.currentMessage);
            this.chatbotCommands(this.rows, this.headings, this.currentMessage);
            /*var temp = this.state.processes.slice();
            temp.push({
                command: this.currentMessage,
                response: this.chatbotCommands(this.rows, this.headings, this.currentMessage),
                data: [{x: data2, y: data1, type: 'scatter', mode: 'lines+points', marker: {color: 'red'}}]
            });
            // this.setState({processes: temp, mean: this.chatbotCommands(this.rows, this.headings, this.currentMessage)});
            this.setState({processes: temp});*/
        }
        
        setTimeout(this.getMessage, 1000);
    }

    getCsv() {
        $.ajax({url: this.props.csvUrl, dataType: 'text'}).done(this.successFunction);
    }

    successFunction(data) {
        var allRows = data.split(/\r?\n|\r/);
        for (var singleRow = 0; singleRow < allRows.length; singleRow++) {
            var rowCells = allRows[singleRow].split(',');
            if (singleRow == 0) {
                this.headings = rowCells;
            }
            else {
                this.rows.push(rowCells);
                /*var temp = this.state.rows.slice();
                temp.push(rowCells);
                this.setState({rows: temp})*/
            }
        }

        console.log(this.headings.length);
        console.log(this.headings);
        console.log(this.rows.length);
        console.log(this.rows[0]);

        this.setState({dataLoaded: true});
        setTimeout(this.getMessage, 1000);
        // setTimeout(this.chatbotCommands(this.rows, this.headings, "Command: Bar, Variables: construction"), 1000);
        // setTimeout(this.chatbotCommands(this.rows, this.headings, "Command: Pie, Variables: statecode"), 1000);
    }

    deleteLastCommand() {
        var temp = this.state.processes.slice(0);
        temp.splice(-1);
        this.setState({processes: temp});
    }

    /*componentDidMount() {
        const { endpoint } = this.state;
        const socket = socketIOClient(endpoint);
        socket.on("FromAPI", data => this.setState({ response: data }));
        socket.connect();
        console.log(JSON.stringify(this.state.csvFile));
        // socket.send(JSON.stringify(this.state.csvFile));
    }*/

    chatbotCommands (csv_data, headers, lex_data) {
        console.log("chatbot command called");
        // Basic implementation of statistical values
        // THIS GOES IN HEADER: <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
        // NOTE: run this to install 'closest-match': component install ianstormtaylor/closest-match
        
        var div = "graph"; //div we put the graphs in
        
        var input = lex_data.split(", Variables: ");
        
        var command = input[0].split(": ")[1];
        var variables = input[1].split(", ");
        
        var fuzzySearch = require('string-similarity'); // instance of "fuzzy search" method for finding any possible closest string
        
        var col1;
        var col2;
    
        var data1 = []; //two columns for (up to 2) variables
        var data1str = [];
        var data2 = [];

        var newcommand = "Command: " + command;
        
        if (variables.length > 0) {
            col1 = headers.indexOf(fuzzySearch.findBestMatch(variables[0], headers).bestMatch.target); // searches for index of closest label match in column names
            // col1 = headers.indexOf(variables[0]);
            newcommand += ", Variables: " + headers[col1];
        }
        
        if (variables.length > 1) {
            col2 = headers.indexOf(fuzzySearch.findBestMatch(variables[1], headers).bestMatch.target);
            // col2 = headers.indexOf(variables[1]);
            newcommand += ", " + headers[col2];
        }
        
        for (var i = 0; i < csv_data.length; i++) {
            data1.push(parseFloat(csv_data[i][col1]));
            data1str.push(csv_data[i][col1]);
            if (variables.length > 1) {
                data2.push(parseFloat(csv_data[i][col2]));
            }
        }

        console.log("made it to the switch");

        var temp = this.state.processes.slice();
    
        switch (command) {
                
    //**********************************************************************************
    //******************************STATISTICS FUNCTIONS********************************
    //**********************************************************************************
                
            case "Mean" :
                console.log("tried to update mean");
                this.setState({mean: this.jStat.mean(data1)});
                temp.push({
                    command: newcommand,
                    response: "The mean is " + this.jStat.mean(data1) + ".",
                    plotted: false,
                    data: [],
                    layout: {}
                });
                // return this.jStat.mean(data1);       
                break;
                
            case "Geometric mean" :
                this.setState({mean: this.jStat.geomean(data1)});
                temp.push({
                    command: newcommand,
                    response: "The geometric mean is " + this.jStat.geomean(data1) + ".",
                    plotted: false,
                    data: [],
                    layout: {}
                });
                // return this.jStat.geomean(data1);       
                break;
                
            case "Median" :
                this.setState({mean: this.jStat.median(data1)});
                temp.push({
                    command: newcommand,
                    response: "The median is " + this.jStat.median(data1) + ".",
                    plotted: false,
                    data: [],
                    layout: {}
                });
                // return this.jStat.median(data1);       
                break;
                
            case "Mode" :
                this.setState({mean: this.jStat.mode(data1)});
                temp.push({
                    command: newcommand,
                    response: "The mode is " + this.jStat.mode(data1) + ".",
                    plotted: false,
                    data: [],
                    layout: {}
                });
                // return this.jStat.mode(data1);       
                break;
                
            case "Range" :
                this.setState({mean: this.jStat.range(data1)});
                temp.push({
                    command: newcommand,
                    response: "The range is " + this.jStat.range(data1) + ".",
                    plotted: false,
                    data: [],
                    layout: {}
                });
                // return this.jStat.range(data1);       
                break;
    
            case "Stddev" :
                this.setState({mean: this.jStat.stdev(data1)});
                temp.push({
                    command: newcommand,
                    response: "The standard deviation is " + this.jStat.stdev(data1) + ".",
                    plotted: false,
                    data: [],
                    layout: {}
                });
                // return this.jStat.stdev(data1);
                break;
                
            case "Variance" :
                this.setState({mean: this.jStat.variance(data1)});
                temp.push({
                    command: newcommand,
                    response: "The variance is " + this.jStat.variance(data1) + ".",
                    plotted: false,
                    data: [],
                    layout: {}
                });
                // return this.jStat.variance(data1);
                break;
    
            case "Correlation" :
                this.setState({mean: this.jStat.corrcoeff(data1, data2)});
                temp.push({
                    command: newcommand,
                    response: "The correlation coefficient is " + this.jStat.corrcoeff(data1, data2) + ".",
                    plotted: false,
                    data: [],
                    layout: {}
                });
                // return this.jStat.corrcoeff(data1, data2);
                break;
                
    //********************************************************************************** 
    //******************************GRAPHING FUNCTIONS**********************************
    //**********************************************************************************  
                
            case "Scatter" :
                console.log("attempted to plot scatter");
                var graph; //used to pass data in for Plotly
                if (variables.length == 1) {
                    for (var i = 1; i <= csv_data.length; i++) {
                        data2.push(i); //we'll use this as the x-axis and data1 as the y-axis
                    }
                    graph = {
                        x: data2,
                        y: data1,
                        mode: 'markers',
                        type: "scatter"
                    };
                    temp.push({
                        command: newcommand,
                        response: "Here you go:",
                        plotted: true,
                        data: [{x: data2, y: data1, type: 'scatter', mode: 'markers', marker: {color: 'red'}}],
                        layout: {'title': 'Scatter Plot of ' + headers[col1] + ' vs. 1 to n', 'xaxis': {'title': headers[col2]}, 'yaxis': {'title': headers[col1]}}
                    })
                    /* this.setState({data: 
                        [{x: data2, y: data1, type: 'scatter', mode: 'lines+points', marker: {color: 'red'}}]
                    });
                    return 0; */
                }
    
                else {
                    temp.push({
                        command: newcommand,
                        response: "Here you go:",
                        plotted: true,
                        data: [{x: data1, y: data2, type: 'scatter', mode: 'markers', marker: {color: 'red'}}],
                        layout: {'title': 'Scatter Plot of ' + headers[col2] + ' vs. ' + headers[col1], 'xaxis': {'title': headers[col1]}, 'yaxis': {'title': headers[col2]}}
                    })
                    /*this.setState({data: 
                        [{x: data1, y: data2, type: 'scatter', mode: 'lines+points', marker: {color: 'red'}}]
                    });
                    return 0;*/
                }
                
    
                // Plotly.newPlot(div, data); //put the name of the div we want the chart in here
                break;
    
            case "Pie" :
                var values = [];
                var freqs = [];
                 
                for (var i = 0; i < data1str.length; i++) {
                    if (!values.includes(data1str[i])) {
                        values.push(data1str[i]);
                        freqs.push(1);
                    }
                
                    else {
                        var p = values.indexOf(data1str[i]);
                        freqs[p]++;
                    }
                }

                console.log(values);
                console.log(freqs);
        
                temp.push({
                    command: newcommand,
                    response: "Here you go:",
                    plotted: true,
                    data: [{values: freqs, labels: values, type: 'pie', marker: {color: 'red'}}],
                    layout: {'title': 'Pie Chart for ' + headers[col1]}
                })

                /*this.setState({data:
                    [{values: csv_data[0], labels: headers, type: 'pie', marker: {color: 'red'}}]
                });
                return 0;*/
    
                // Plotly.newPlot(div, data);
                break;
        
            case "Bar" :
                var values = [];
                var freqs = [];
             
                for (var i = 0; i < data1str.length; i++) {
                    if (!values.includes(data1str[i])) {
                        values.push(data1str[i]);
                        freqs.push(1);
                    }
            
                    else {
                        var p = values.indexOf(data1str[i]);
                        freqs[p]++;
                    }
                }

                console.log(values);
                console.log(freqs);
                temp.push({
                    command: newcommand,
                    response: "Here you go:",
                    plotted: true,
                    data: [{x: values, y: freqs, type: 'bar', marker: {color: 'red'}}],
                    layout: {
                        'title': 'Bar Chart for ' + headers[col1],
                        'xaxis': {'title': headers[col1]}, 
                        'yaxis': {'title': "Frequency"},
                    }
                })

                /* this.setState({data:
                    [{x: csv_data[0], y: headers, type: 'bar', marker: {color: 'red'}}]
                });
                return 0; */
    
                // Plotly.newPlot(div, data);
                break;
            //**********************************************************************************
//********************************MACHINE LEARNING**********************************
//**********************************************************************************
            
            case "LinReg": 
            
                // NOTE: install via "npm install --save ml-regression-simple-linear"

                const regression = new SimpleLinearRegression(data1, data2);
        
                var boundMax = this.jStat.max(data1) * 1.1; // used to determine how far the manually drawn line goes
                var boundMin = this.jStat.min(data1) - 0.1*Math.abs(this.jStat.min(data1)); // Makes sure it goes a little before min
                console.log(boundMin);
                console.log(boundMax);
                temp.push({
                    command: newcommand,
                    response: "Here you go:",
                    plotted: true,
                    data: [{
                        x: [boundMin, boundMax],
                        y: [regression.slope*boundMin + regression.intercept, regression.slope*boundMax + regression.intercept],
                        type: 'scatter',
                        mode: 'lines',
                        marker: {color: 'black'}
                    },
                    {x: data1, y: data2, type: 'scatter', mode: 'markers', marker: {color: 'red'}}
                    ],
                    layout: {
                        'showlegend': false,
                        'title': 'Linear Regression for ' + headers[col2] + ' vs. ' + headers[col1],
                        'xaxis': {'title': headers[col1]}, 
                        'yaxis': {'title': headers[col2]},
                        'annotations': [{'x': boundMin, 'y': regression.slope*boundMin + regression.intercept, 'text': 'Y = ' + regression.slope + '*X + ' + regression.intercept}]
                    }
                    // data: [{x0: boundMin, y0: regression.slope * boundMin + regression.intercept, x1: boundMax, y1: regression.slope * boundMax + regression.intercept, type: 'line', line: {color: 'red', width: 3}}, {x: data1, y: data2, mode = 'markers'}]
                })

                break;
        

            case "SVM" :
                // NOTE: to install, "npm install ml-svm"
                // Instantiate the svm classifier
                // OLD INSTANTIATION
                /*var SVM = require('ml-svm');
                var options = {
                    C: 0.01,
                    tol: 10e-4,
                    maxPasses: 10,
                    maxIterations: 10000,
                    kernel: 'rbf',
                    kernelOptions: {
                        sigma: 0.5
                    }
                };*/

                var svm = require("svm");
                var SVM = new svm.SVM();

                // var svm = new SVM(options);
        
                var features = csv_data.slice();
                var labels = [];

                for (var i = 0; i < features.length; i++) {
                    for (var j = 0; j < features[0].length; j++) {
                        features[i][j] = parseInt(features[i][j]);
                    }
                }
                /*var features = [[0, 0], [0, 1], [1, 1], [1, 0]];
                var labels = [1, -1, 1, -1];*/

                for (var i = 0; i < features.length; i++) {
                    labels.push(features[i].splice(col1, 1)[0]);
                }

                for (var i = 0; i < labels.length; i++) {
                    if (labels[i] == 0) {
                        labels[i] = -1;
                    }
                    // console.log(labels[i]);
                }

                console.log(features.length, labels.length, features[0].length);
        
                var testing = features.splice(Math.round(features.length * 0.8));
                var testLabels = labels.splice(features.length);

                /*var testing = features;
                var testLabels = labels;*/

                console.log(features.length, testing.length, labels.length, features[0].length);
                console.log(features);
                console.log(labels);
                console.log(testing);
                console.log(testLabels);

                // svm.train(features, labels);

                SVM.train(features, labels);

                // Let's see how narrow the margin is
                // var margins = svm.margin(features);
        
                /*temp.push({
                    command: newcommand,
                    response: "The margins are " + this.margins,
                    plotted: false,
                    data: []
                });*/
        
                // When we want to do more with the SVM
        
                // Let's see if it is separable by testing on the training data
                // svm.predict(testing); // [1, -1, 1, -1]
                /*
                // I want to see what my support vectors are
                var supportVectors = svm.supportVectors();

                // Now we want to save the model for later use
                var model = svm.toJSON();

                /// ... later, you can make predictions without retraining the model
                var importedSvm = SVM.load(model);
                importedSvm.predict(features)*/

                // Let's see if it is separable by testing on the training data
                //var predictions = svm.predict(testing); // [1, -1, 1, -1]
                var predictLabels = SVM.predict(testing);
                console.log(predictLabels);
            
                var zeroCorrect = 0; //counter variables for 2x2 heatmap
                var oneCorrect = 0;
            
                var zeroIncorrect = 0;
                var oneIncorrect = 0;
            
                var zeroTotal = 0;
                var oneTotal = 0;
            
                for (var i = 0; i < testLabels.length; i++) {
                    if (testLabels[i] == -1) {
                        if (predictLabels[i] == testLabels[i]) {
                            zeroCorrect++;
                        }
                        else {
                            zeroIncorrect++;
                        }
                        zeroTotal++;
                    }
                    else if (testLabels[i] == 1) {
                        if (predictLabels[i] == testLabels[i]) {
                            oneCorrect++;
                        }
                        else {
                            oneIncorrect++;
                        }
                        oneTotal++;
                    }
                }

                console.log(zeroCorrect, zeroIncorrect, oneIncorrect, oneCorrect);
            
                temp.push({
                    command: newcommand,
                    response: "Here you go. 80% of the dataset was used to train the model, and 20% was selected as the testing set. The accuracy of the model on the test set is " + (100*(zeroCorrect + oneCorrect)/(zeroCorrect + oneCorrect + zeroIncorrect + oneIncorrect)).toFixed(1) + "%. Below is a heatmap of the classification results:",
                    plotted: true,
                    data: [{z: [[zeroCorrect, zeroIncorrect], [oneIncorrect, oneCorrect]], type: "heatmap"}],
                    layout: {
                        'title': 'SVM Heatmap for ' + headers[col1],
                        'xaxis': {'title': 'Predicted'}, 
                        'yaxis': {'title': 'Actual'}
                    }
                });

                break;
        }
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