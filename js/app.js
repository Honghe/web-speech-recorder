//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; 						//stream from getUserMedia()
var rec; 							//Recorder.js object
var input; 							//MediaStreamAudioSourceNode we'll be recording

// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext //audio context to help us record


function startRecording2(recordButton, stopButton) {
    return function () {
        console.log(recordButton.id + " clicked");

        /*
            Simple constraints object, for more advanced audio features see
            https://addpipe.com/blog/audio-constraints-getusermedia/
        */

        var constraints = {audio: true, video: false}

        /*
           Disable the record button until we get a success or fail from getUserMedia()
       */

        recordButton.disabled = true;
        stopButton.disabled = false;

        /*
            We're using the standard promise based getUserMedia()
            https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
        */

        navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
            console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

            /*
                create an audio context after getUserMedia is called
                sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
                the sampleRate defaults to the one set in your OS for your playback device

            */
            audioContext = new AudioContext();

            //update the format
            document.getElementById("formats").innerHTML = "Format: 1 channel pcm @ " + audioContext.sampleRate / 1000 + "kHz"

            /*  assign to gumStream for later use  */
            gumStream = stream;

            /* use the stream */
            input = audioContext.createMediaStreamSource(stream);

            /*
                Create the Recorder object and configure to record mono sound (1 channel)
                Recording 2 channels  will double the file size
            */
            rec = new Recorder(input, {numChannels: 1})

            //start the recording process
            rec.record()

            console.log("Recording started");

        }).catch(function (err) {
            //enable the record button if getUserMedia() fails
            recordButton.disabled = false;
            stopButton.disabled = true;
        });
    }
}

function stopRecording2(recordButton, stopButton, filename, recordingsList) {
    return function () {
        console.log(stopButton.id + " clicked");

        //disable the stop button, enable the record too allow for new recordings
        stopButton.disabled = true;
        recordButton.disabled = false;

        //tell the recorder to stop the recording
        rec.stop();

        //stop microphone access
        gumStream.getAudioTracks()[0].stop();

        //create the wav blob and pass it on to createDownloadLink
        rec.exportWAV(createDownloadLink2(filename, recordingsList));
    }
}

function createDownloadLink2(filename, audio_container) {
    return function (blob) {
        var url = URL.createObjectURL(blob);
        var au = document.createElement('audio');
        var li = document.createElement('li');
        var link = document.createElement('a');

        //name of .wav file to use during upload and download (without extendion)
        // var filename = new Date().toISOString();

        //add controls to the <audio> element
        au.controls = true;
        au.src = url;

        // save to disk link
        link.href = url;
        link.download = filename + ".wav"; //download forces the browser to donwload the file using the  filename
        link.innerHTML = "Save to disk";

        //add the new audio element to li
        li.appendChild(au);
        // last update time text node
        var p = document.createElement('p');
        p.setAttribute("class", "p_nomargin");
        var lastUploadTime = document.createTextNode(" ");
        p.appendChild(document.createTextNode("LastUpload:"));
        p.appendChild(document.createTextNode(" "))//add a space in between
        p.appendChild(lastUploadTime);
        //add the filename to the li
        li.appendChild(document.createTextNode(filename + ".wav "))

        //add the save to disk link to li
        // li.appendChild(link);

        //upload link
        var upload = document.createElement('a');
        upload.href = "#";
        upload.innerHTML = "Upload";
        upload.addEventListener("click", function (event) {
            var xhr = new XMLHttpRequest();
            xhr.onload = function (e) {
                if (this.readyState === 4) {
                    console.log("Server returned: ", e.target.responseText);
                    lastUploadTime.nodeValue = new Date().toTimeString();
                } else {
                    console.log("upload error.");
                    lastUploadTime.nodeValue = "upload err."
                }
            };
            var fd = new FormData();
            fd.append("audio_data", blob, filename);
            xhr.open("POST", "upload", true);
            xhr.send(fd);
        });
        li.appendChild(document.createTextNode(" "))//add a space in between
        li.appendChild(upload)//add the upload link to li
        li.appendChild(p)//add the upload link to li

        // clear old child
        while (audio_container.firstChild) {
            audio_container.removeChild(audio_container.firstChild);
        }
        //add the li element to the ol
        audio_container.appendChild(li);
    }
}

names = ["孙权", "曹操", "刘备"]
names_pinyin = ['sunquan', 'caocao', 'liubei']

function initList() {
    var ol = document.getElementById("records");

    // 布局
    for (var i = 0; i < names.length; i++) {
        var title = names[i];
        var div = document.createElement("div");
        let filename = names_pinyin[i];

        // title
        var listItem = document.createElement("h4");
        listItem.textContent = title;
        div.appendChild(listItem);
        // audio element container
        var audio_container = document.createElement("div");
        var divButton = document.createElement("div");
        divButton.setAttribute("class", "controls");
        var recordButton = document.createElement("button");
        recordButton.setAttribute("id", "recordButton" + "_" + filename);
        recordButton.innerHTML = "Record";
        var stopButton = document.createElement("button");
        stopButton.setAttribute("id", "stopButton" + "_" + filename);
        stopButton.innerHTML = "Stop+Upload";
        stopButton.disabled = true;
        recordButton.addEventListener("click", startRecording2(recordButton, stopButton));
        stopButton.addEventListener("click", stopRecording2(recordButton, stopButton, filename, audio_container));
        divButton.appendChild(recordButton);
        divButton.appendChild(stopButton);
        div.appendChild(divButton);
        div.appendChild(audio_container);
        ol.appendChild(div);
    }
}

initList()
