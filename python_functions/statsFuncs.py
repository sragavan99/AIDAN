# List of Python functions
# We use pandas to process the data from the csv file
# Then each function uses properties of the pandas dataset to perform operations

import numpy as np
import pandas as pd
import difflib as dl
import json

# importing the csv file

dataFrame = pd.read_csv("path-to-file.csv")


####################################################################################################
# Function for the Levenshtein distance of two strings (utilizes dynamic programming)
# Source: https://en.wikibooks.org/wiki/Algorithm_Implementation/Strings/Levenshtein_distance#Python
####################################################################################################

def levenshtein(s1, s2):
    if len(s1) < len(s2):
        return levenshtein(s2, s1)

    # len(s1) >= len(s2)
    if len(s2) == 0:
        return len(s1)

    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[
                             j + 1] + 1  # j+1 instead of j since previous_row and current_row are one character longer
            deletions = current_row[j] + 1  # than s2
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row

    return previous_row[-1]

# Getting the appropriate column name from the voice recognition input

spokenText = "test"
columnNames = list(dataFrame)
min = -1
colName = ""

for c in columnNames:
    if min == -1:
        min = levenshtein(c, spokenText)
        colName = c
    else:
        lev = levenshtein(c, spokenText)
        if lev < min:
            min = lev
            colName = c

# Temp variables for JSON
newcommand = ""

def mean(df, col):
    return json.dumps({command: newcommand, response: "The mean is: " + df[col].mean(), plotted: false, data: [], layout: {}})

def median(df, col):
    return json.dumps({command: newcommand, response: "The median is: " + df[col].median(), plotted: false, data: [], layout: {}})

def range(df, col):
    return json.dumps({command: newcommand, response: "The range is: " + (df[col].max() - df[col].min()), plotted: false, data: [], layout: {}})
    return df[col].max() - df[col].min()

def stddev(df, col):

def variance(df, col):

def correlation(df, col):

def scatterPlot(df, col):

def pieChart(df, col):

def barGraph(df, col):

def linearRegression(df, col):

def svm(df, col):
