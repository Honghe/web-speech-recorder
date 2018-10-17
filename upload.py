import time

from flask import Flask, request
from flask import send_from_directory
import os
from werkzeug.utils import secure_filename
from flask import jsonify
import logging
from datetime import datetime

logging.basicConfig(filename='http.log', level=logging.INFO)

app = Flask(__name__)


def save_audio(f, filename):
    # uploaded filename is formatted as <speaker name>__<record>.wav
    # so split to different bucket
    bucket, filename = filename.split('__')
    upload_data = 'upload_data'
    bucket_path = os.path.join(upload_data, bucket)
    if not os.path.exists(bucket_path):
        os.mkdir(bucket_path)

    f_path = os.path.join(bucket_path, filename)
    f.save(f_path)
    return f_path


@app.route("/")
def hello():
    return send_from_directory('./', 'index.html')


@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('js', path)


@app.route('/cs/<path:path>')
def send_cs(path):
    return send_from_directory('cs', path)


@app.route('/upload', methods=['POST'])
def upload_file():
    # save file
    f = request.files['audio_data']
    name = f.filename
    t = time.time()
    d = datetime.fromtimestamp(t).strftime('%Y-%m-%d %H:%M:%S')
    logging.info("{} received file {}".format(d, f.filename))
    # not use secure_filename, avoid filename changed
    # name_s = secure_filename(name)
    name_f = name + '.wav'
    f_path = save_audio(f, name_f)

    # return received summary
    rst_ar = []
    rst_ar.append(f.filename)
    rst_ar.append(os.stat(f_path).st_size)
    rst_ar.append(f.content_type)
    return jsonify(rst_ar)


if __name__ == "__main__":
    app.run(host='0.0.0.0', ssl_context='adhoc', debug=True)
