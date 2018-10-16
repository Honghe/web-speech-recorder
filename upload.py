from flask import Flask
from flask import send_from_directory

app = Flask(__name__)

@app.route("/")
def hello():
    return send_from_directory('./', 'index.html')

@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('js', path)

@app.route('/cs/<path:path>')
def send_cs(path):
    return send_from_directory('cs', path)

if __name__ == "__main__":
    app.run(host='172.31.23.210', ssl_context='adhoc', debug=True)
