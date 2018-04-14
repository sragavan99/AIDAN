# List of Python functions
# We use pandas to process the data from the csv file
# Then each function uses properties of the pandas dataset to perform operations
import sys
import json
import numpy as np
import pandas as pd
import difflib as dl
import editdistance
from sklearn.preprocessing import LabelEncoder, OneHotEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.metrics import confusion_matrix, accuracy_score
from sklearn.linear_model import LinearRegression

funcNames = ["mean", "median", "range", "stddev", "variance", "correlation", "scatterPlot", "pieChart", "barGraph",
            "linearRegression", "svm"]

headers = []
usercommand = ""

def levenshtein(s1, s2):
    return editdistance.eval(s1, s2)

def evaluate(df, command, param):
    global usercommand
    global headers
    sys.stderr.write("type in statFuncs: " + str(type(df)) + "\n")
    headers = list(df)
    sys.stderr.write(str(headers) + "\n")
    minDist = -1
    newCommand = ""
    colName = ""

    for c in funcNames:
      if minDist == -1:
        minDist = levenshtein(c, command)
        newCommand = c
      else:
        lev = levenshtein(c, command)
        if lev < minDist:
          minDist = lev
          newCommand = c

    params = param.strip("\"").split(", ")
    newParam = ""

    for p in params:
      minDist = -1
      if len(params) > 1 and newParam != "":
        newParam += ", "
      for c in headers:
        if minDist == -1:
          minDist = levenshtein(c, p)
          colName = c
        else:
          lev = levenshtein(c, p)
          if lev < minDist:
            minDist = lev
            colName = c
      newParam += '\"' + colName + '\"'
  
    usercommand = "Command:" + newCommand + ", Variable:" + newParam
    sys.stderr.write("final command: " + usercommand + "\n")
    return eval(newCommand + '(df, ' + newParam +  ')')

def mean(df, col):
    return json.dumps({"command": usercommand,
                       "response": "The mean is: " + str(df[col].mean()),
                       "plotted": False,
                       "data": [],
                       "layout": {}})

def median(df, col):
    return json.dumps({"command": usercommand,
                       "response": "The median is: " + str(df[col].median()),
                       "plotted": False,
                       "data": [],
                       "layout": {}})

def range(df, col):
    return json.dumps({"command": usercommand,
                       "response": "The range is: " + str(df[col].max() - df[col].min()),
                       "plotted": False,
                       "data": [],
                       "layout": {}})

def stddev(df, col):
    return json.dumps({"command": usercommand,
                       "response": "The standard deviation is: " + str(df[col].std()),
                       "plotted": False,
                       "data": [],
                       "layout": {}})

def variance(df, col):
    return json.dumps({"command": usercommand,
                       "response": "The variance is: " + str(df[col].var()),
                       "plotted": False,
                       "data": [],
                       "layout": {}})

def correlation(df, col1, col2):
    return json.dumps({"command": usercommand,
                       "response": "The correlation is: " + str(df[col1].corr(df[col2])),
                       "plotted": False,
                       "data": [],
                       "layout": {}})

def scatterPlot(df, col1, col2):
    return json.dumps({ "command": usercommand,
                        "response": "Here you go:",
                        "plotted": True,
                        "data": [{"x": df[col1].tolist(), "y": df[col2].tolist(), "type": 'scatter', "mode": 'markers', "marker": {"color": 'red'}}],
                        "layout": {'title': 'Scatter Plot of ' + col2 + ' vs. ' + col1, 'xaxis': {'title': col1}, 'yaxis': {'title': col2}}
                    })

def pieChart(df, col):
    freqs = df[col].value_counts().tolist()
    valNames = df[col].value_counts().keys().tolist()

    return json.dumps({"command": usercommand,
                       "response": "Here you go:",
                       "plotted": True,
                       "data": [{"values": freqs, "labels": valNames, "type": 'pie', "marker": {"color": 'red'}}],
                       "layout": {'title': 'Pie Chart for ' + col}
                       })

def barGraph(df, col):
    freqs = df[col].value_counts().tolist()
    valNames = df[col].value_counts().keys().tolist()

    return json.dumps({"command": usercommand,
                       "response": "Here you go:",
                       "plotted": True,
                       "data": [{"x": valNames, "y": freqs, "type": 'bar', "marker": {"color": 'red'}}],
                       "layout": {'title': 'Bar Chart for ' + col,
                                'xaxis': {'title': col},
                                'yaxis': {'title': "Frequency"}}
                    })

def linreg(x, y): #x, y are arrays
    n = len(x)
    x = [float(x[i]) for i in xrange(n)]
    y = [float(y[i]) for i in xrange(n)]
    xsquared = sum([x[i]*x[i] for i in xrange(n)])
    xy = sum([x[i]*y[i] for i in xrange(n)])
    boundMin = min(x) #minimum value of x
    boundMax = max(x) #maximum value of x
    sx = sum(x)
    sy = sum(y)
    intercept = (sy*xsquared - sx*xy)/(n*xsquared - sx*sx)
    slope = (n*xy - sx*sy)/(n*xsquared - sx*sx)
    return (boundMin, boundMax, intercept, slope)

def linearRegression(df, col1, col2):
  # Implement bound max and min (should be very easy)
  boundMin, boundMax, intercept, slope = linreg(df[col1], df[col2])
  return json.dumps({
      "command": usercommand,
      "response": "Here you go:",
      "plotted": True,
      "data": [{
          "x": [str(boundMin), str(boundMax)],
          "y": [str(slope * boundMin + intercept), str(slope * boundMax + intercept)],
          "type": 'scatter',
          "mode": 'lines',
          "marker": {"color": 'black'}
      },
          {"x": df[col1].tolist(), "y": df[col2].tolist(), "type": 'scatter', "mode": 'markers', "marker": {"color": 'red'}}
      ],
      "layout": {
                  'showlegend': False,
                  'title': 'Linear Regression for ' + col2 + ' vs. ' + col1,
                  'xaxis': {'title': col1},
                  'yaxis': {'title': col2},
                  'annotations': [{'x': str(boundMin), 'y': str(slope * boundMin + intercept),
                                   'text': 'Y = ' + str(slope) + '*X + ' + str(intercept)}]
              }

      })

def svm(df, col):
    y = df[col].values

    if (df[col].dtype == 'object'):
        # convert the labels from strings to numbers (0,1,2....)
        y = LabelEncoder().fit_transform(y)

    df = df.drop([col], axis=1)

    for f in df.columns:
        if df[f].dtype == 'object':
            lbl_enc = LabelEncoder()
            # same as above encoding. it takes every object dtype from
            # pandas dataframe and converts to numerical labels
            df[f] = lbl_enc.fit_transform(df[f].values)

    X = df.values
    # binarize the encoded columns. this is not needed if you are using a tree based algorithm
    # ohe = OneHotEncoder(categorical_features=[0, 1, 4, 5, 6])
    # X = ohe.fit_transform(X)

    # use the following for SVMs (with_mean=False for sparse data)
    scl = StandardScaler(with_mean=False)
    X = scl.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

    model = SVC()
    model.fit(X_train, y_train)

    testpred = model.predict(X_test)

# the following generates a 2D array of the numbers we need for the heatmap
# In binary classification, the count of true negatives is C_{0,0}, false negatives is C_{1,0}, true positives is C_{1,1} and false positives is C_{0,1}.
    heatmap_data = confusion_matrix(y_test, testpred)

    zeroCorrect = heatmap_data[0][0]
    oneCorrect = heatmap_data[1][1]
    zeroIncorrect = heatmap_data[0][1]
    oneIncorrect = heatmap_data[1][0]

    acc = int(100*accuracy_score(y_test, testpred))

    return json.dumps({
        "command": usercommand,
        "response": "Here you go. 80% of the dataset was used to train the model, and 20% was selected as the testing set. The accuracy of the model on the test set is " + 
                  str(acc) + "%. Below is a heatmap of the classification results:",
        "plotted": True,
        "data": [{"z": [[zeroCorrect, zeroIncorrect], [oneIncorrect, oneCorrect]], "type": "heatmap"}],
        "layout": {
            'title': 'SVM Heatmap for ' + col,
            'xaxis': {'title': 'Predicted'},
            'yaxis': {'title': 'Actual'}
        }
    })

if __name__ == "__main__":
    defdirectory = ""
    filename = "pima-indians-diabetes.csv"
    df = pd.read_csv(defdirectory + filename)
    sys.stderr.write(str(evaluate(df, "linearRegression", "age, glucose")) + "\n")
