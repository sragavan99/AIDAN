# AIDAN

<h1> How to use AIDAN </h1>

<b> Try AIDAN here: http://aidan-labs.com/ </b>
  
Instructions: Upload a dataset in the form of a .CSV file (or use our sample csv file, pima_indians_diabetes.csv— this option is available if you scroll down). AIDAN currently supports the following capabilities: 
 * 1-Var Statistics: Mean, Median, Standard Deviation
 * 2-Var Statistics: Correlation
 * Data Visualization: Bar Chart, Pie Chart, Scatter Plot
 * Machine Learning: Linear Regression, Support Vector Machine (Binary Classification)
 
 While the bot supports a wide range of conversation, it still cannot generalize to all user input. Thus, please type in "help" to get a list of all the acceptable ways to make a request to the bot. Otherwise, it's pretty intuitive– just start a conversation, and see your data come to life!

<h1> What (and why) we are </h1>

By now, it's almost cliche to say that data is everywhere. That's because it really is. Whether you're a statistician, a biologist, historian, or even a high school student— you're inevitably going to use data. But tools to analyze this data are either too complicated to use or too simple to be of use. That's where we got our inspiration, that with the advent of powerful conversational AI, we can empower people to take control of and analyze their datasets. A.I.D.A.N. stands for 'AI for Data Analysis, "Now!"'. We provide a radically simple conversational interface for users to work in very sophisticated ways with their data. 

The user can upload their own dataset (currently in .csv file format), and we then take them to an easy-to-use interface where they can converse with AIDAN. As an example, the user might ask AIDAN to "fit a best-fit line for house price and number of bedrooms". AIDAN has a friendly conversation with them, and then processes the request and displays the regression equation and plot to the right of the chat window. As they continue to converse with AIDAN, the plots and statistics they request appear on the right in a dynamic, notebook-like format.

AIDAN supports a lot of functionality, including one and two-variable statistics, data visualization, and machine learning. In addition, we allow the user to converse with AIDAN using either text or their voice, as well as the ability to interact with the plots (zoom in, hover, etc.) and export them in standard image formats. We have also built in contextual understanding for the voice option, such that we can still understand the intent of the user even if speech recognition does not interpret the user entirely correctly.

<h1> Our Technology </h1>

Our entire platform is built on Microsoft Azure. We built AIDAN using the Azure Bot Service and trained it with LUIS (Language Understanding and Intelligence Service). This allowed us to build a powerful and highly customizable chatbot, with a large number of intents and the ability to understand human input. Compared to the previous chatbot platform we began with, Amazon Lex, Azure Bot Service gave us more power and flexibility. The bot was integrated into the frontend of the website, which was built using ReactJS. We built our backend server in Python, where we wrote the data analysis functions using well-known data analysis and machine learning libraries. We used Azure File Storage to store and retrieve the dataset that the user uploads.

The biggest technical challenge in developing our product was getting all the different components to talk to each other. In summary, this is the process that begins when a user visits the website:

1. User uploads a dataset to the website. The dataset is sent to Azure File Storage, and the Python backend grabs the file from there. The frontend sends an HTTP request to the Python backend to let it know that the user has uploaded a new dataset.

2. User starts a conversation with the bot. The user specifies how they want to analyze their data, and the bot asks which variables and confirms the query.

3. Bot sends command to Python backend. Once the bot figures out exactly what the user's query is, it sends an HTTP POST request to the Python server with a specific format for the command and any variables necessary to execute the command. 

4. Python backend parses command and performs data analysis. The function corresponding to the user's command is called, and the result of the analysis is packaged into a JSON file.

5. The frontend reacieves the analysis from Python and displays the results. The JSON is sent to the frontend via an HTTP request, and the frontend parses the JSON file and shows the results of the analysis. Thus, we complete the full circle from user input to data analysis.

As is evident, many components had to talk to each other— React to Python and back, Bot to Python, FileStorage to React and Python, etc. Designing this complex system was a very challenging task, but we succeeded after a lot of hard work.




