from flask import Flask
app = Flask(__name__)
from flask import request

@app.route("/")
def hello():
    return "Hello World!"


@app.route("/", methods=['POST'])
def post():
    d = request.data
    print 'got', d
    return d


if __name__ == '__main__':
    app.run()
