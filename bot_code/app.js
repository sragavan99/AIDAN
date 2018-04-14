/*-----------------------------------------------------------------------------
A simple Language Understanding (LUIS) bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata 
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user
// This default message handler is invoked if the user's utterance doesn't
// match any intents handled by other dialogs.
var bot = new builder.UniversalBot(connector, function (session, args) {
    session.send('You reached the default message handler. You said \'%s\'.', session.message.text);
});

bot.set('storage', tableStorage);

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v2.0/apps/' + luisAppId + '?subscription-key=' + luisAPIKey;
const request = require('request');

// Create a recognizer that gets intents from LUIS, and add it to the bot
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
bot.recognizer(recognizer);

// Add a dialog for each intent that the LUIS app recognizes.
// See https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-recognize-intent-luis 
bot.dialog('GreetingDialog',
    (session) => {
        session.send('Hello! My name is AIDAN. Please say \"help\" if you have any questions about how we can chat.');
        session.endDialog();
    }
).triggerAction({
    matches: 'Greeting'
});

bot.dialog('HelpDialog',
    (session) => {
        session.send('Here are some examples of things you can ask me: \n\"What is the mean of glucose?\"\n\"Find the median\"\n\"Let\'s find the standard deviation of insulin\"\n\"How related are mass and pressure?\"\n\"Alright Aidan, it\'s bar chart time\"\n\"Let\'s do a pie chart for diabetes\"\n\"Aidan can you scatter age against mass for me?\"\n\"Aidan can you find me a best fit line for pressure against pedigree?\"\n\"Let\'s run some machine learning on diabetes.\"');
        session.endDialog();
    }
).triggerAction({
    matches: 'Help'
});

/*bot.dialog('CancelDialog',
    (session) => {
        session.send('Sure, what can I do for you next?');
        session.endDialog();
    }
).triggerAction({
    matches: 'Cancel'
});*/

bot.dialog('MeanDialog', [
    function(session, args, next) {
        // get variable from intent
        var intent = args.intent;
        var variable = builder.EntityRecognizer.findEntity(intent.entities, 'Variable');
        var command = session.dialogData.command = {
            variable: variable ? variable.entity : null,
        };
        
        // prompt for variable if necessary
        if (!command.variable) {
            builder.Prompts.text(session, 'For which variable?');
        }
        else {
            next();
        }
    },
    function (session, results, next) {
        // update variable if just entered
        var command = session.dialogData.command;
        if (results.response) {
            command.variable = results.response;
        }

        // prompt for confirmation
        builder.Prompts.confirm(session, `Just to make sure, you would like me to compute the mean of ${command.variable}?`);
    },
    function (session, results) {
        if (results.response) {
            // display command and TODO send through to python backend
            var command = session.dialogData.command;
            
            var msg = "Command:mean, Variable:" + "\"" + command.variable + "\"";
            session.send("Command: Mean, Variables: %s",command.variable);
            request.post({
                url: "http://132.148.155.201:50000",
                form: {mes: msg + new Array(1000 - msg.length + 1).join(':')},
                function(error, response, body) {
                    console.log(body);
                    session.endDialog();
                }
            });
        }
        else {
            // prompt for next command
            session.endDialog('Sure, what can I do for you next?');
        }
    }
]).triggerAction({
    matches: 'Mean'
});

// NEED TO ADD INTENT FOR MEDIAN
bot.dialog('MedianDialog', [
    function(session, args, next) {
        // get variable from intent
        var intent = args.intent;
        var variable = builder.EntityRecognizer.findEntity(intent.entities, 'Variable');
        var command = session.dialogData.command = {
            variable: variable ? variable.entity : null,
        };
        
        // prompt for variable if necessary
        if (!command.variable) {
            builder.Prompts.text(session, 'For which variable?');
        }
        else {
            next();
        }
    },
    function (session, results, next) {
        // update variable if just entered
        var command = session.dialogData.command;
        if (results.response) {
            command.variable = results.response;
        }

        // prompt for confirmation
        builder.Prompts.confirm(session, `Just to make sure, you would like me to compute the median of ${command.variable}?`);
    },
    function (session, results) {
        if (results.response) {
            // display command and TODO send through to python backend
            var command = session.dialogData.command;
            
            var msg = "Command:median, Variable:" + "\"" + command.variable + "\"";
            session.send("Command: Median, Variables: %s",command.variable);
            request.post({
                url: "http://132.148.155.201:50000",
                form: {mes: msg + new Array(1000 - msg.length + 1).join(':')},
                function(error, response, body) {
                    console.log(body);
                    session.endDialog();
                }
            });
        }
        else {
            // prompt for next command
            session.endDialog('Sure, what can I do for you next?');
        }
    }
]).triggerAction({
    matches: 'Median'
});

bot.dialog('STDDialog', [
    function(session, args, next) {
        // get variable from intent
        var intent = args.intent;
        var variable = builder.EntityRecognizer.findEntity(intent.entities, 'Variable');
        var command = session.dialogData.command = {
            variable: variable ? variable.entity : null,
        };
        
        // prompt for variable if necessary
        if (!command.variable) {
            builder.Prompts.text(session, 'For which variable?');
        }
        else {
            next();
        }
    },
    function (session, results, next) {
        // update variable if just entered
        var command = session.dialogData.command;
        if (results.response) {
            command.variable = results.response;
        }

        // prompt for confirmation
        builder.Prompts.confirm(session, `Just to make sure, you would like me to compute the standard deviation of ${command.variable}?`);
    },
    function (session, results) {
        if (results.response) {
            // display command and TODO send through to python backend
            var command = session.dialogData.command;
            
            var msg = "Command:stddev, Variable:" + "\"" + command.variable + "\"";
            session.send("Command: Standard Deviation, Variables: %s",command.variable);
            request.post({
                url: "http://132.148.155.201:50000",
                form: {mes: msg + new Array(1000 - msg.length + 1).join(':')},
                function(error, response, body) {
                    console.log(body);
                    session.endDialog();
                }
            });
        }
        else {
            // prompt for next command
            session.endDialog('Sure, what can I do for you next?');
        }
    }
]).triggerAction({
    matches: 'Stddev'
});

bot.dialog('PieDialog', [
    function(session, args, next) {
        // get variable from intent
        var intent = args.intent;
        var variable = builder.EntityRecognizer.findEntity(intent.entities, 'Variable');
        var command = session.dialogData.command = {
            variable: variable ? variable.entity : null,
        };
        
        // prompt for variable if necessary
        if (!command.variable) {
            builder.Prompts.text(session, 'For which variable?');
        }
        else {
            next();
        }
    },
    function (session, results, next) {
        // update variable if just entered
        var command = session.dialogData.command;
        if (results.response) {
            command.variable = results.response;
        }

        // prompt for confirmation
        builder.Prompts.confirm(session, `Just to make sure, you would like me to draw a pie chart for ${command.variable}?`);
    },
    function (session, results) {
        if (results.response) {
            // display command and TODO send through to python backend
            var command = session.dialogData.command;
            
            var msg = "Command:pieChart, Variable:" + "\"" + command.variable + "\"";
            session.send("Command: Pie Chart, Variables: %s",command.variable);
            request.post({
                url: "http://132.148.155.201:50000",
                form: {mes: msg + new Array(1000 - msg.length + 1).join(':')},
                function(error, response, body) {
                    console.log(body);
                    session.endDialog();
                }
            });
        }
        else {
            // prompt for next command
            session.endDialog('Sure, what can I do for you next?');
        }
    }
]).triggerAction({
    matches: 'Pie'
});

bot.dialog('BarDialog', [
    function(session, args, next) {
        // get variable from intent
        var intent = args.intent;
        var variable = builder.EntityRecognizer.findEntity(intent.entities, 'Variable');
        var command = session.dialogData.command = {
            variable: variable ? variable.entity : null,
        };
        
        // prompt for variable if necessary
        if (!command.variable) {
            builder.Prompts.text(session, 'For which variable?');
        }
        else {
            next();
        }
    },
    function (session, results, next) {
        // update variable if just entered
        var command = session.dialogData.command;
        if (results.response) {
            command.variable = results.response;
        }

        // prompt for confirmation
        builder.Prompts.confirm(session, `Just to make sure, you would like me to draw a bar chart for ${command.variable}?`);
    },
    function (session, results) {
        if (results.response) {
            // display command and TODO send through to python backend
            var command = session.dialogData.command;
            
            var msg = "Command:barGraph, Variable:" + "\"" + command.variable + "\"";
            session.send("Command: Bar Graph, Variables: %s",command.variable);
            request.post({
                url: "http://132.148.155.201:50000",
                form: {mes: msg + new Array(1000 - msg.length + 1).join(':')},
                function(error, response, body) {
                    console.log(body);
                    session.endDialog();
                }
            });
        }
        /*else {
            // prompt for next command
            session.endDialog('Sure, what can I do for you next?');
        }*/
    }
]).triggerAction({
    matches: 'Bar'
});

bot.dialog('SVMDialog', [
    function(session, args, next) {
        // get variable from intent
        var intent = args.intent;
        var variable = builder.EntityRecognizer.findEntity(intent.entities, 'Variable');
        var command = session.dialogData.command = {
            variable: variable ? variable.entity : null,
        };
        
        // prompt for variable if necessary
        if (!command.variable) {
            builder.Prompts.text(session, 'For which variable?');
        }
        else {
            next();
        }
    },
    function (session, results, next) {
        // update variable if just entered
        var command = session.dialogData.command;
        if (results.response) {
            command.variable = results.response;
        }

        // prompt for confirmation
        builder.Prompts.confirm(session, `Just to make sure, you would like me to predict ${command.variable} using machine learning?`);
    },
    function (session, results) {
        if (results.response) {
            // display command and TODO send through to python backend
            var command = session.dialogData.command;
            
            var msg = "Command:svm, Variable:" + "\"" + command.variable + "\"";
            session.send("Command: SVM, Variables: %s",command.variable);
            request.post({
                url: "http://132.148.155.201:50000",
                form: {mes: msg + new Array(1000 - msg.length + 1).join(':')},
                function(error, response, body) {
                    console.log(body);
                    session.endDialog();
                }
            });
        }
        else {
            // prompt for next command
            session.endDialog('Sure, what can I do for you next?');
        }
    }
]).triggerAction({
    matches: 'SVM'
});

bot.dialog('ScatterDialog', [
    function(session, args, next) {
        // get variable from intent
        var intent = args.intent;
        var variable1 = builder.EntityRecognizer.findEntity(intent.entities, 'Variable');
        var variable2 = builder.EntityRecognizer.findEntity(intent.entities, 'Variable2');
        var command = session.dialogData.command = {
            variable1: variable1 ? variable1.entity : null,
            variable2: variable2 ? variable2.entity : null
        };
        
        // prompt for variable if necessary
        if (!command.variable1) {
            builder.Prompts.text(session, 'What is the first variable?');
        }
        else {
            next();
        }
    },
    function(session, results, next) {
        var command = session.dialogData.command;
        if (results.response) {
            command.variable1 = results.response;
        }
        if (!command.variable2) {
            builder.Prompts.text(session, 'What is the second variable?');
        }
        else {
            next();
        }
    },
    function (session, results, next) {
        // update variable if just entered
        var command = session.dialogData.command;
        if (results.response) {
            command.variable2 = results.response;
        }

        // prompt for confirmation
        builder.Prompts.confirm(session, `Just to make sure, you would like me to draw a scatter plot of ${command.variable2} vs. ${command.variable1}?`);
    },
    function (session, results) {
        if (results.response) {
            // display command and TODO send through to python backend
            var command = session.dialogData.command;
            
            var msg = "Command:scatterPlot, Variable:" + "\"" + command.variable1 + "\", \"" + command.variable2 + "\"";
            session.send("Command: Scatter Plot, Variables: %s, %s", command.variable1, command.variable2);
            request.post({
                url: "http://132.148.155.201:50000",
                form: {mes: msg + new Array(1000 - msg.length + 1).join(':')},
                function(error, response, body) {
                    console.log(body);
                    session.endDialog();
                }
            });
        }
        else {
            // prompt for next command
            session.endDialog('Sure, what can I do for you next?');
        }
    }
]).triggerAction({
    matches: 'Scatter'
});

bot.dialog('CorrDialog', [
    function(session, args, next) {
        // get variable from intent
        var intent = args.intent;
        var variable1 = builder.EntityRecognizer.findEntity(intent.entities, 'Variable');
        var variable2 = builder.EntityRecognizer.findEntity(intent.entities, 'Variable2');
        var command = session.dialogData.command = {
            variable1: variable1 ? variable1.entity : null,
            variable2: variable2 ? variable2.entity : null
        };
        
        // prompt for variable if necessary
        if (!command.variable1) {
            builder.Prompts.text(session, 'What is the first variable?');
        }
        else {
            next();
        }
    },
    function(session, results, next) {
        var command = session.dialogData.command;
        if (results.response) {
            command.variable1 = results.response;
        }
        if (!command.variable2) {
            builder.Prompts.text(session, 'What is the second variable?');
        }
        else {
            next();
        }
    },
    function (session, results, next) {
        // update variable if just entered
        var command = session.dialogData.command;
        if (results.response) {
            command.variable2 = results.response;
        }

        // prompt for confirmation
        builder.Prompts.confirm(session, `Just to make sure, you would like me to find the correlation of ${command.variable2} vs. ${command.variable1}?`);
    },
    function (session, results) {
        if (results.response) {
            // display command and TODO send through to python backend
            var command = session.dialogData.command;
            
            var msg = "Command:correlation, Variable:" + "\"" + command.variable1 + "\", \"" + command.variable2 + "\"";
            session.send("Command: Correlation, Variables: %s, %s", command.variable1, command.variable2);
            request.post({
                url: "http://132.148.155.201:50000",
                form: {mes: msg + new Array(1000 - msg.length + 1).join(':')},
                function(error, response, body) {
                    console.log(body);
                    session.endDialog();
                }
            });
        }
        else {
            // prompt for next command
            session.endDialog('Sure, what can I do for you next?');
        }
    }
]).triggerAction({
    matches: 'Correlation'
});

bot.dialog('LinearDialog', [
    function(session, args, next) {
        // get variable from intent
        var intent = args.intent;
        var variable1 = builder.EntityRecognizer.findEntity(intent.entities, 'Variable');
        var variable2 = builder.EntityRecognizer.findEntity(intent.entities, 'Variable2');
        var command = session.dialogData.command = {
            variable1: variable1 ? variable1.entity : null,
            variable2: variable2 ? variable2.entity : null
        };
        
        // prompt for variable if necessary
        if (!command.variable1) {
            builder.Prompts.text(session, 'What is the first variable?');
        }
        else {
            next();
        }
    },
    function(session, results, next) {
        var command = session.dialogData.command;
        if (results.response) {
            command.variable1 = results.response;
        }
        if (!command.variable2) {
            builder.Prompts.text(session, 'What is the second variable?');
        }
        else {
            next();
        }
    },
    function (session, results, next) {
        // update variable if just entered
        var command = session.dialogData.command;
        if (results.response) {
            command.variable2 = results.response;
        }

        // prompt for confirmation
        builder.Prompts.confirm(session, `Just to make sure, you would like me to find the linear regression of ${command.variable2} vs. ${command.variable1}?`);
    },
    function (session, results) {
        if (results.response) {
            // display command and TODO send through to python backend
            var command = session.dialogData.command;
            
            var msg = "Command:linearRegression, Variable:" + "\"" + command.variable1 + "\", \"" + command.variable2 + "\"";
            session.send("Command: Linear Regression, Variables: %s, %s", command.variable1, command.variable2);
            request.post({
                url: "http://132.148.155.201:50000",
                form: {mes: msg + new Array(1000 - msg.length + 1).join(':')},
                function(error, response, body) {
                    console.log(body);
                    session.endDialog();
                }
            });
        }
        else {
            // prompt for next command
            session.endDialog('Sure, what can I do for you next?');
        }
    }
]).triggerAction({
    matches: 'LinReg'
});

