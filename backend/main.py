from flask import Flask, request, json
from flask_cors import CORS
import pathlib
import re

# create new Flask app
app = Flask(__name__)
# allow Cross-origin resource sharing access
CORS(app)

# create loging directory
pathlib.Path('logs/p2/ratings').mkdir(parents=True, exist_ok=True)
pathlib.Path('logs/p1/ratings').mkdir(parents=True, exist_ok=True)

@app.route('/')
def index():
    return 'This is the WMT20 ELITR server. For info about this project or the API please see the <a href="https://github.com/ELITR/wmt20-elitr-testsuite">documentation</a>.'


@app.route('/login_p2', methods=['POST'])
def logP2Service():
    try:
        assertArgsJ(request, 'AID')
    except Exception as e:
        return json.jsonify({'status': 'FAIL', 'error': e.__str__()})
    
    print('P2 LOGIN', request.json['AID'])
    
    with open('logs/content.json', 'r') as f:
        content = json.load(f)

    with open('logs/p2/queue_user.json', 'r') as f:
        queues = json.load(f)

    AID = request.json['AID']
    content['progress'] = queues[AID]['progress']
    content['queue_doc'] = queues[AID]['queue_doc']
    content['queue_mkb'] = queues[AID]['queue_mkb']
    return json.jsonify(content)

@app.route('/login_p1', methods=['POST'])
def logP1Service():
    try:
        assertArgsJ(request, 'AID')
    except Exception as e:
        return json.jsonify({'status': 'FAIL', 'error': e.__str__()})

    print('P1 LOGIN', request.json['AID'])

    with open('logs/content.json', 'r') as f:
        content = json.load(f)

    with open('logs/p1/queue_user.json', 'r') as f:
        queues = json.load(f)

    AID = request.json['AID']
    content['progress'] = queues[AID]['progress']
    content['queue_doc'] = queues[AID]['queue_doc']
    content['queue_mkb'] = queues[AID]['queue_mkb']
    content['queue_mts'] = queues[AID]['queue_mts']
    return json.jsonify(content)


@app.route('/save_p2', methods=['POST'])
def saveP2Service():
    try:
        assertArgsJ(request, ['AID', 'progress', 'current', 'rating'])
    except Exception as e:
        return json.jsonify({'status': 'FAIL', 'error': e.__str__()})

    AID = request.json['AID']

    if not validate_AID(AID):
        return json.jsonify({'status': 'FAIL', 'error': 'Invalid AID.'})

    print('P2 SAVE', AID)

    rating_obj = {
        'doc': request.json['current']['doc'],
        'mkb': request.json['current']['mkb'],
        'sec': request.json['current']['sec'],
        'rating': request.json['rating']
    }

    with open(f'logs/p2/ratings/{AID}.jlog', 'a+') as f:
        f.write(json.dumps(rating_obj)+'\n')

    queues = json.load(open('logs/p2/queue_user.json', 'r'))
    queues[AID]['progress'] = request.json['progress']
    json.dump(queues, open('logs/p2/queue_user.json', 'w'))

    return {'status': 'OK'}

@app.route('/save_p1', methods=['POST'])
def saveP1Service():
    try:
        assertArgsJ(request, ['AID', 'progress', 'current', 'rating', 'mt_name'])
    except Exception as e:
        return json.jsonify({'status': 'FAIL', 'error': e.__str__()})

    AID = request.json['AID']

    if not validate_AID(AID):
        return json.jsonify({'status': 'FAIL', 'error': 'Invalid AID.'})

    print('P1 SAVE', AID)

    rating_obj = {
        'doc': request.json['current']['doc'],
        'mkb': request.json['current']['mkb'],
        'mtn': request.json['current']['mtn'],
        'rating': request.json['rating'],
        'mt_name': request.json['mt_name']
    }

    with open(f'logs/p1/ratings/{AID}.jlog', 'a+') as f:
        f.write(json.dumps(rating_obj)+'\n')

    queues = json.load(open('logs/p1/queue_user.json', 'r'))
    queues[AID]['progress'] = request.json['progress']
    json.dump(queues, open('logs/p1/queue_user.json', 'w'))

    return {'status': 'OK'}

def validate_AID(AID):
    return re.match(r'[a-zA-Z0-9]+', AID)

def assertArgs(args, assertees):
    """
    Throws an exception if assertees are not a subset of args
    """
    if type(assertees) is not list:
        assertees = [assertees]
    for assertee in assertees:
        if assertee not in args.keys():
            raise Exception("Parameter '{}' is missing".format(assertee))


def assertArgsJ(request, assertees):
    """
    Throws an exception if assertees are not a subset of args
    Uses the JSON object
    """
    if type(assertees) is not list:
        assertees = [assertees]
    for assertee in assertees:
        if assertee not in request.json:
            raise Exception("Parameter '{}' is missing".format(assertee))
