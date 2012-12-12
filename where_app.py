# fb_call, main routine taken from the Heroku sample Facebook app

import os
import json

import requests
from flask import Flask, request, render_template, abort

from conf import group_number

def fb_call(call, args=None):
    url = "https://graph.facebook.com/{0}".format(call)
    r = requests.get(url, params=args)
    return json.loads(r.text)

def access_allowed(access_token):
    try:
        r = fb_call('me/groups', {'access_token': access_token})
        if ('data' not in r):
            return False
        for group in r['data']:
            if (('id' in group) and (group_number == int(group['id']))):
                # In the group with the right id
                return True
    except requests.exceptions.RequestException:
        pass
    return False

app = Flask(__name__)

@app.route('/channel.html', methods=['GET', 'POST'])
def get_channel():
    return render_template('channel.html')

intern_data = ''
map_credentials = ''

@app.route('/')
def index():
    base_url = request.base_url
    if not base_url.startswith('https'):
        assert(base_url.startswith('http'))
        base_url = 'https' + base_url[4:]

    if ('access_token' not in request.args):
        return render_template('my_index.html', base_url=base_url)
    else:
        access_token = request.args['access_token']
        if access_allowed(access_token):
            return render_template('where_app.html',
                                   access_token=access_token,
                                   intern_data=intern_data,
                                   map_credentials=map_credentials)
        else:
            abort(403)

    return render_template('my_index.html')

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    intern_data = open('intern_data.js', 'r').read()
    map_credentials = open('map_credentials.js', 'r').read()
    app.run(host='0.0.0.0', port=port)
