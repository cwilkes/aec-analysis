import sys
import redis
import uuid
import gzip
import os
import logging
from hashlib import sha1
import time

log = logging.getLogger('run')

redis_client = redis.from_url(os.getenv('REDISTOGO_URL', 'redis://localhost:6379'))

log.info('Redis client: %s' % (redis_client, ))

label_prefix = '/labels/'


upload_buffer_names = dict()
cur_name = None


def get_data(data_type, tag, hash_id):
    return eval(redis_client.get('/points/%s/%s/%s' % (data_type, tag, hash_id)))


def get_labels():
    labels = dict()
    for k in redis_client.keys(label_prefix + '*'):
        labels[k[len(label_prefix):]] = eval(redis_client.get(k))
    #log.info('Labels: %s' % (labels, ))
    return labels


def add_label(label, tags):
    log.info('Adding label %s for %s' % (label, tags))
    redis_client.set('/labels/%s' % (label, ), repr(tags))


def get_data_keys(data_type=None, tag=None):
    ret = dict()
    all_keys = redis_client.keys('/points/%s/%s/*' % ('*' if data_type is None else data_type, '*' if tag is None else tag))
    for key in all_keys:
        p = key.split('/')[2:]
        if not p[0] in ret:
            ret[p[0]] = dict()
        if not p[1] in ret[p[0]]:
            ret[p[0]][p[1]] = list()
        ret[p[0]][p[1]].append(p[2])
    return ret


def publish_label(socketio, label):
    log.info('publish %s', label)
    tags = eval(redis_client.get(label_prefix + label))
    log.info('tags: %s' % (tags, ))
    for tag in tags.keys():
        log.info('Emitting data for channel: %s data: %s', tag, tags[tag])
        real_key = redis_client.keys('/points/%s/%s/*' % (tag, tags[tag]))[0]
        data=eval(redis_client.get(real_key))
        socketio.emit('data', dict(channel=tag, data=data), namespace='/data')
    return tags


def change_label(label_old_name, label_new_name):
    redis_client.rename(label_prefix + label_old_name, label_prefix + label_new_name)


def save_and_notify_upload(socketio, photos, datastore, channel, namespace='/data'):
    global cur_name, upload_buffer_names
    log.info('Save and notify on channel %s' % (channel, ))
    filename = photos.save(datastore, name=str(uuid.uuid4()) + '.')
    # docs are wrong, does not have the full path
    filename = os.path.join('/tmp/files', filename)
    reader = gzip.open(filename) if filename.endswith('.gz') else open(filename)
    lines = list()
    inputs = (_.strip() for _ in reader)
    tag = next(inputs)
    for p in (_.split(',') for _ in inputs):
        lines.append([float(_.strip()) for _ in p])
    reader.close()
    os.remove(filename)
    data = str(lines)
    redis_key = '/points/%s/%s/%s' % (channel, tag, sha1(data).hexdigest())
    log.info('Lines #: %s, tag: %s, Redis key id: %s' % (len(lines), tag, redis_key))
    redis_client.set(redis_key, data)
    if cur_name is None:
        cur_name = 'Run_%d' % (int(time.time(), ))
        log.info('Set current label name to %s', cur_name)
    upload_buffer_names[channel] = tag
    if len(upload_buffer_names) == 4:
        add_label(cur_name, upload_buffer_names)
        cur_name = None
        upload_buffer_names = dict()
    else:
        log.info('Not doing auto labeling as != 4 keys: %s', str(upload_buffer_names.keys()))
    socketio.emit('data', dict(channel=channel, data=lines, tag=tag), namespace=namespace)
