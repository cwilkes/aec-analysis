import sys
import redis
import uuid
import gzip
import os
import logging
from hashlib import sha1


log = logging.getLogger('services')

redis_client = redis.from_url(os.getenv('REDISTOGO_URL', 'redis://localhost:6379'))

log.info('Redis client: %s' % (redis_client, ))


def get_data(data_type, tag, hash_id):
    return eval(redis_client.get('/points/%s/%s/%s' % (data_type, tag, hash_id)))


def add_label(label, tags):
    log.info('Adding %s : %s' % (label, tags))
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


def save_and_notify_upload(socketio, photos, datastore, channel, namespace='/data'):
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
    socketio.emit('data', dict(channel=channel, data=lines, tag=tag), namespace=namespace)
