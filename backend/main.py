from flask import Flask, request, json
from flask_cors import CORS
import pathlib
import re
import os

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

def read_user_rating(phase, AID):
    rating_file = f'logs/{phase}/ratings/{AID}.json'
    if not os.path.isfile(rating_file):
        rating_obj = {}
    else:
        with open(rating_file, 'r') as f:
            rating_obj = json.loads(f.read())    
    return rating_obj, rating_file

@app.route('/login_p1', methods=['POST'])
def loginP1():
    AID = request.json['AID']

    rating_obj, _ = read_user_rating('p1', AID)

    with open('logs/content.json', 'r') as f:
        content = json.load(f)

    with open('logs/p1/queue_user.json', 'r') as f:
        queues = json.load(f)

    content['progress'] = queues[AID]['progress']
    content['queue_doc'] = queues[AID]['queue_doc']
    content['queue_mts'] = queues[AID]['queue_mts']
    content['ratings'] = rating_obj
    return json.jsonify(content)

@app.route('/login_p2', methods=['POST'])
def loginP2():
    AID = getAID(request)
    
    rating_obj, _ = read_user_rating('p2', AID)
    
    with open('logs/content.json', 'r') as f:
        content = json.load(f)

    with open('logs/p2/queue_user.json', 'r') as f:
        queues = json.load(f)

    content['progress'] = queues[AID]['progress']
    content['queue_doc'] = queues[AID]['queue_doc']
    content['queue_mkb'] = queues[AID]['queue_mkb']
    content['ratings'] = rating_obj
    return json.jsonify(content)

@app.route('/save_rating_p1', methods=['POST'])
def saveRatingP1():
    AID = getAID(request)

    rating_obj, rating_file = read_user_rating('p1', AID)

    location_signature = f"{request.json['current']['doc_name']}-{request.json['current']['mt_name']}"
    rating_obj[location_signature] = request.json['rating']
    json.dump(rating_obj, open(rating_file, 'w'), ensure_ascii=False)

    return {'status': 'OK'}

@app.route('/save_rating_p2', methods=['POST'])
def saveRatingP2():
    AID = getAID(request)

    rating_obj, rating_file = read_user_rating('p2', AID)

    location_signature = f"{request.json['current']['doc_name']}-{request.json['current']['mkb_name']}-{request.json['current']['sec']}"
    rating_obj[location_signature] = request.json['rating']
    json.dump(rating_obj, open(rating_file, 'w'), ensure_ascii=False)

    return {'status': 'OK'}

@app.route('/save_progress_p1', methods=['POST'])
def saveProgressP1():
    AID = getAID(request)
    queues = json.load(open('logs/p1/queue_user.json', 'r'))
    queues[AID]['progress'] = request.json['progress']
    json.dump(queues, open('logs/p1/queue_user.json', 'w'), ensure_ascii=False)

    return {'status': 'OK'}

@app.route('/save_progress_p2', methods=['POST'])
def saveProgressP2():
    AID = getAID(request)
    queues = json.load(open('logs/p2/queue_user.json', 'r'))
    queues[AID]['progress'] = request.json['progress']
    json.dump(queues, open('logs/p2/queue_user.json', 'w'), ensure_ascii=False)

    return {'status': 'OK'}

def getAID(request):
    AID = request.json['AID']
    if not re.match(r'[a-zA-Z0-9]+', AID):
        raise Exception('Invalid AID')
    return AID

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