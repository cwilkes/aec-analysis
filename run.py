from flask import Flask
from flask import request, render_template, send_file, logging
from flask.ext.socketio import SocketIO, emit, send, BaseNamespace

from flask.ext.uploads import UploadSet, configure_uploads
import os
import uuid
import gzip


app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret'
DEFAULT_PORT = 5000

socketio = SocketIO(app)

log = logging.getLogger('')
log.setLevel(logging.DEBUG)
log.addHandler(logging.StreamHandler())

photos = UploadSet()
photos.file_allowed = lambda a, b: True

app.config['UPLOADS_DEFAULT_DEST'] = '/tmp'
configure_uploads(app, photos)

@app.route('/old')
def index():
    return render_template('test.html')


@app.route('/')
def index_demo():
    return render_template('data_demo.html')


@app.route('/app')
def three_g_app():
    return render_template('app.html')


def _save_and_notify_upload(channel, namespace='/data'):
    log.info('Save and notify on channel %s' % (channel, ))
    #log.info('Request: %s : %s : %s : %s' % (request.values, request.files, request.form, request.headers))
    filename = photos.save(request.files['data'], name=str(uuid.uuid4()) + '.')
    # docs are wrong, does not have the full path
    filename = os.path.join('/tmp/files', filename)
    reader = gzip.open(filename) if filename.endswith('.gz') else open(filename)
    lines = [_ for _ in reader]
    reader.close()
    os.remove(filename)
    log.info('Lines #: %s' % (len(lines), ))
    message = dict(data=lines, channel=channel)
    socketio.emit('data', message, namespace=namespace)

@app.route('/api/<channel>', methods=['POST',])
def api_upload_channel(channel):
    _save_and_notify_upload(channel)
    return 'ok'

@app.route('/data2/{name}')
def existing_data(name):
    log.info("serving %s" % (name, ))
    return send_file(name);


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
