from flask import Flask, jsonify
import json
app = Flask(__name__)


f = open('test.json', 'r')
lines = f.readlines()
f.close()

index = {}

for line in lines:
	j = json.loads(line)
	if 'body' not in j:
		index[j['hash']] = "[]"
	else:
		index[j['hash']] = j['body']

@app.route('/block/<hash>')
def getblock(hash):
    return jsonify(index[hash])

app.run()
