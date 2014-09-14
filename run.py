from flask import Flask
from flask import request, render_template, send_file, logging
from flask.ext.socketio import SocketIO, emit
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret'
DEFAULT_PORT = 5000

socketio = SocketIO(app)

log = logging.getLogger('')
log.setLevel(logging.DEBUG)
log.addHandler(logging.StreamHandler())

@app.route('/old')
def index():
    return render_template('test.html')


@app.route('/')
def index_demo():
    return render_template('data_demo.html')


@app.route('/app')
def three_g_app():
    return render_template('app.html')


@app.route('/socket.io')
def return_socketiojs():
    return send_file('static/js/socket.io-1.1.0.js')


@socketio.on('my event', namespace='/test')
def test_message(message):
    emit('my response', {'data': message['data']})

@socketio.on('my broadcast event', namespace='/test')
def test_message(message):
    emit('my response', {'data': message['data']}, broadcast=True)


@socketio.on('connect', namespace='/test')
def test_connect():
    emit('my response', {'data': 'Connected'})

@socketio.on('disconnect', namespace='/test')
def test_disconnect():
    print('Client disconnected')


@socketio.on('data', namespace='/data')
def data_message(message):
    emit('data', message, broadcast=True)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', str(DEFAULT_PORT)))
    if port == 0:
        port = DEFAULT_PORT
    host = '0.0.0.0'
    app.debug = len(os.environ.get('DEBUG', '')) != 0
    socketio.run(app, port=port, host=host)
