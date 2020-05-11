from flask import Flask, request, json
from flask_cors import CORS

# create new Flask app
app = Flask(__name__)
# allow Cross-origin resource sharing access
CORS(app)


@app.route('/')
def index():
    return 'This is the WMT20 ELITR server. For info about this project or the API please see the <a href="https://github.com/ELITR/wmt20-elitr-testsuite">documentation</a>.'


@app.route('/login', methods=['POST'])
def logService():
    try:
        assertArgsJ(request, 'AID')
    except Exception as e:
        return json.jsonify({'status': 'FAIL', 'error': e.__str__()})
    print('LOGIN', request.json['AID'])
    with open('logs/content.json', 'r') as f:
        content = json.load(f)

    with open('logs/queue_user.json', 'r') as f:
        queues = json.load(f)

    AID = request.json['AID']
    content['progress'] = queues[AID]['progress'] 
    content['queue_doc'] = queues[AID]['queue_doc']
    content['queue_mkb'] = queues[AID]['queue_mkb']
    return json.jsonify(content)


@app.route('/save', methods=['POST'])
def saveService():
    try:
        assertArgsJ(request, ['AID', 'progress', 'current', 'rating'])
    except Exception as e:
        return json.jsonify({'status': 'FAIL', 'error': e.__str__()})

    AID = request.json['AID']
    print('SAVE', AID)
    try:
        with open('logs/rating_user.json', 'r') as f:
            content = json.load(f)
    except FileNotFoundError as _e:
        content = {}

    if not AID in content:
        content[AID] = []

    content[AID].append({
        'doc': request.json['current']['doc'],
        'mkb': request.json['current']['mkb'],
        'sec': request.json['current']['sec'],
        'rating': request.json['rating']
    })

    with open('logs/rating_user.json', 'w') as f:
        json.dump(content, f)

    with open('logs/queue_user.json', 'r') as f:
        queues = json.load(f)
    queues[AID]['progress'] = request.json['progress']
    with open('logs/queue_user.json', 'w') as f:
        json.dump(queues, f)

    return {'status': 'OK'}


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
