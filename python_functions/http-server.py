import os
import sys
import json
import urllib2
import SocketServer
import statsFuncs
import pandas as pd
from azure.storage.file import FileService
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer

df = None
filename = None
LIMIT = 1000
results = {}
defdirectory = ""

results["count"] = 0

class S(BaseHTTPRequestHandler):
    def _set_headers(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

    def do_GET(self):
        global results
        sys.stderr.write("get request\n")
        self._set_headers()
        self.wfile.write(json.dumps(results))
        results.clear()
        results["count"] = 0

    def do_HEAD(self):
        self._set_headers()
    
    def do_POST(self):
        global df
        global filename

        sys.stderr.write("post request\n")
        payload = self.rfile.read(LIMIT)
        sys.stderr.write("payload: " + payload + "\n")
        # Doesn't do anything with posted data
        # remove improperly formed uri encoded ';'
        if payload.find("Command") != -1:
            chatbotcom = payload.split('%%')[0]
            chatbotcom = urllib2.unquote(chatbotcom)
            sys.stderr.write("chatbotcom " + chatbotcom + "\n")
            chatbotcom = chatbotcom.rstrip(":%3A")
            stuff = chatbotcom.split(':')
            command = stuff[1].split(', ')[0]
            param = stuff[2]

            sys.stdout.write("stuff: " + str(stuff) + "\n")
            sys.stderr.write("command: " + command + " param: " + param + "\n")
            results[results["count"]] = statsFuncs.evaluate(df, command, param)
            results["count"] += 1
        
        elif payload.find("Upload") != -1:
            if filename != None:
                os.remove(defdirectory + filename)
            payload.replace(';', '')
            filename = payload.split(':')[1].replace('\"', '')
            sys.stderr.write("filename: " + filename + "\n")
            file_service = FileService(account_name="aidanstoring2",account_key="LqFolz9P9CgAZQK459VVGzSxqRwcsmGmw3YKGhSNnYNJiiC6L2If2iAS9Fim+vONuIY0wAvRtO2h7uI5dA2TRg==")
            file_service.get_file_to_path('aidanshare', None, './aidandirectory/' + filename, defdirectory + filename)
            df = pd.read_csv(defdirectory + filename)
        
def run(server_class=HTTPServer, handler_class=S, port=50000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print 'Starting httpd...'
    httpd.serve_forever()

if __name__ == "__main__":
    from sys import argv

    if len(argv) == 2:
        run(port=int(argv[1]))
    else:
        run()
