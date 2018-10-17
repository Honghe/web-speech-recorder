from flask import Flask, request
from flask import send_from_directory
import os
from werkzeug.utils import secure_filename
from flask import jsonify

app = Flask(__name__)

def save_audio(f, filename):
    upload_data = 'upload_data'
    if not os.path.exists(upload_data):
        os.mkdir(upload_data)

    f_path = os.path.join(upload_data, filename)
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
    name_s = secure_filename(name)
    name_f = name_s + '.wav'
    f_path = save_audio(f, name_f)

    # return received summary
    rst_ar = []
    rst_ar.append(f.filename)
    rst_ar.append(os.stat(f_path).st_size)
    rst_ar.append(f.content_type)
    return jsonify(rst_ar)


if __name__ == "__main__":
    app.run(host='0.0.0.0', ssl_context='adhoc', debug=True)
