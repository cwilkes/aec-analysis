from flask import Flask
from flask import request
import os

app = Flask(__name__)
DEFAULT_PORT = 5000

@app.route("/")
def hello():
    return "Hello World!"


@app.route("/", methods=['POST'])
def post():
    d = request.data
    print 'got', d
    return d


if __name__ == '__main__':
    port = int(os.environ.get('PORT', str(DEFAULT_PORT)))
    if port == 0:
        port = DEFAULT_PORT
    host = '0.0.0.0'
    app.run(port=port, host=host)
