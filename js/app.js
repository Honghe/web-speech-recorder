//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; 						//stream from getUserMedia()
var rec; 							//Recorder.js object
var input; 							//MediaStreamAudioSourceNode we'll be recording

// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext //audio context to help us record
var speaker = document.getElementById("speaker");

function check_speaker() {
    if (speaker.value.trim().length <= 0) {
        alert("Please set Speaker first.");
        return false;
    } else {
        return true;
    }
}

function startRecording2(recordButton, stopButton) {
    return function () {
        if (check_speaker() == false) {
            return;
        }
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

            console.log(recordButton.id + " started");

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
    function uploadAudio(lastUploadTime, blob) {
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
        // add speaker before name
        var filename_with_speaker = speaker.value.trim() + "__" + filename;
        fd.append("audio_data", blob, filename_with_speaker);
        xhr.open("POST", "upload", true);
        xhr.send(fd);
    }

    return function (blob) {
        var url = URL.createObjectURL(blob);
        var au = document.createElement('audio');
        var li = document.createElement('li');
        var link = document.createElement('a');

        //name of .wav file to use during upload and download (without extendion)
        // var filename = new Date().toISOString();

        //add controls to the <audio> element
        au.controls = true;
        au.autoplay = true;
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
            uploadAudio(lastUploadTime, blob);
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
        // auto upload
        uploadAudio(lastUploadTime, blob);
    }
}

names = ["孙权", "曹操", "刘备"]
names_pinyin = ['sunquan', 'caocao', 'liubei']

names = ['给马东风一个星星', '给魏明桦一个星星', '给陈剑锋一个星星', '给张茂峰一个星星', '给张建宏一个星星', '给陆利伟一个星星', '给王嘉奇一个星星', '给孙文明一个星星', '给吴汉卿一个星星', '给黄杰一个星星', '给刘桂源一朵红花', '给杨丽莎一朵红花', '给李新华一朵红花', '给何晓颖一朵红花', '给郑成锵一朵红花', '给聂夏杰一朵红花', '给余小苗一朵红花', '给郑智雄一朵红花', '给邹德国一朵红花', '给张瑞怀一朵红花', '给李顺点赞', '给路建雷点赞', '给吴世堂点赞', '给柯超额点赞', '给李妍点赞', '给万冬冬点赞', '给李晓为点赞', '给林志斌点赞', '给潘登点赞', '给吴孟和点赞', '给魏明桦掌声', '给陈剑锋掌声', '给张茂峰掌声', '给张建宏掌声', '给陆利伟掌声', '给王嘉奇掌声', '给孙文明掌声', '给吴汉卿掌声', '给黄杰掌声', '给黄欧林掌声', '给杨丽莎加1分', '给李新华加1分', '给何晓颖加1分', '给郑成锵加1分', '给聂夏杰加1分', '给余小苗加1分', '给郑智雄加1分', '给邹德国加1分', '给张瑞怀加1分', '给储婉琳加1分', '给路建雷加2分', '给吴世堂加2分', '给柯超额加2分', '给李妍加2分', '给万冬冬加2分', '给李晓为加2分', '给林志斌加2分', '给潘登加2分', '给吴孟和加2分', '给许云岚加2分', '给陈剑锋加3分', '给张茂峰加3分', '给张建宏加3分', '给陆利伟加3分', '给王嘉奇加3分', '给孙文明加3分', '给吴汉卿加3分', '给黄杰加3分', '给黄欧林加3分', '给涂宝华加3分', '给李新华加4分', '给何晓颖加4分', '给郑成锵加4分', '给聂夏杰加4分', '给余小苗加4分', '给郑智雄加4分', '给邹德国加4分', '给张瑞怀加4分', '给储婉琳加4分', '给卞小瑾加4分', '给吴世堂加5分', '给柯超额加5分', '给李妍加5分', '给万冬冬加5分', '给李晓为加5分', '给林志斌加5分', '给潘登加5分', '给吴孟和加5分', '给许云岚加5分', '给李俊彦加5分', '给张茂峰加10分', '给张建宏加10分', '给陆利伟加10分', '给王嘉奇加10分', '给孙文明加10分', '给吴汉卿加10分', '给黄杰加10分', '给黄欧林加10分', '给涂宝华加10分', '给王权权加10分']
names_pinyin = ['ge3i_ma3_do1ng_fe1ng_yi2_ge4_xi1ng_xi1ng', 'ge3i_we4i_mi2ng_hua4_yi2_ge4_xi1ng_xi1ng', 'ge3i_che2n_jia4n_fe1ng_yi2_ge4_xi1ng_xi1ng', 'ge3i_zha1ng_ma4o_fe1ng_yi2_ge4_xi1ng_xi1ng', 'ge3i_zha1ng_jia4n_ho2ng_yi2_ge4_xi1ng_xi1ng', 'ge3i_lu4_li4_we3i_yi2_ge4_xi1ng_xi1ng', 'ge3i_wa2ng_jia1_qi2_yi2_ge4_xi1ng_xi1ng', 'ge3i_su1n_we2n_mi2ng_yi2_ge4_xi1ng_xi1ng', 'ge3i_wu2_ha4n_qi1ng_yi2_ge4_xi1ng_xi1ng', 'ge3i_hua2ng_jie2_yi2_ge4_xi1ng_xi1ng', 'ge3i_liu2_gui4_yua2n_yi1_duo3_ho2ng_hua1', 'ge3i_ya2ng_li4_sha1_yi1_duo3_ho2ng_hua1', 'ge3i_li3_xi1n_hua2_yi1_duo3_ho2ng_hua1', 'ge3i_he2_xia3o_yi3ng_yi1_duo3_ho2ng_hua1', 'ge3i_zhe4ng_che2ng_qia1ng_yi1_duo3_ho2ng_hua1', 'ge3i_nie4_xia4_jie2_yi1_duo3_ho2ng_hua1', 'ge3i_yu2_xia3o_mia2o_yi1_duo3_ho2ng_hua1', 'ge3i_zhe4ng_zhi4_xio2ng_yi1_duo3_ho2ng_hua1', 'ge3i_zo1u_de2_guo2_yi1_duo3_ho2ng_hua1', 'ge3i_zha1ng_rui4_hua2i_yi1_duo3_ho2ng_hua1', 'ge3i_li3_shu4n_dia3n_za4n', 'ge3i_lu4_jia4n_le2i_dia3n_za4n', 'ge3i_wu2_shi4_ta2ng_dia3n_za4n', 'ge3i_ke1_cha1o_e2_dia3n_za4n', 'ge3i_li3_ya2n_dia3n_za4n', 'ge3i_wa4n_do1ng_do1ng_dia3n_za4n', 'ge3i_li3_xia3o_we4i_dia3n_za4n', 'ge3i_li2n_zhi4_bi1n_dia3n_za4n', 'ge3i_pa1n_de1ng_dia3n_za4n', 'ge3i_wu2_me4ng_he2_dia3n_za4n', 'ge3i_we4i_mi2ng_hua4_zha3ng_she1ng', 'ge3i_che2n_jia4n_fe1ng_zha3ng_she1ng', 'ge3i_zha1ng_ma4o_fe1ng_zha3ng_she1ng', 'ge3i_zha1ng_jia4n_ho2ng_zha3ng_she1ng', 'ge3i_lu4_li4_we3i_zha3ng_she1ng', 'ge3i_wa2ng_jia1_qi2_zha3ng_she1ng', 'ge3i_su1n_we2n_mi2ng_zha3ng_she1ng', 'ge3i_wu2_ha4n_qi1ng_zha3ng_she1ng', 'ge3i_hua2ng_jie2_zha3ng_she1ng', 'ge3i_hua2ng_o1u_li2n_zha3ng_she1ng', 'ge3i_ya2ng_li4_sha1_jia1_1_fe1n', 'ge3i_li3_xi1n_hua2_jia1_1_fe1n', 'ge3i_he2_xia3o_yi3ng_jia1_1_fe1n', 'ge3i_zhe4ng_che2ng_qia1ng_jia1_1_fe1n', 'ge3i_nie4_xia4_jie2_jia1_1_fe1n', 'ge3i_yu2_xia3o_mia2o_jia1_1_fe1n', 'ge3i_zhe4ng_zhi4_xio2ng_jia1_1_fe1n', 'ge3i_zo1u_de2_guo2_jia1_1_fe1n', 'ge3i_zha1ng_rui4_hua2i_jia1_1_fe1n', 'ge3i_chu3_wa3n_li2n_jia1_1_fe1n', 'ge3i_lu4_jia4n_le2i_jia1_2_fe1n', 'ge3i_wu2_shi4_ta2ng_jia1_2_fe1n', 'ge3i_ke1_cha1o_e2_jia1_2_fe1n', 'ge3i_li3_ya2n_jia1_2_fe1n', 'ge3i_wa4n_do1ng_do1ng_jia1_2_fe1n', 'ge3i_li3_xia3o_we4i_jia1_2_fe1n', 'ge3i_li2n_zhi4_bi1n_jia1_2_fe1n', 'ge3i_pa1n_de1ng_jia1_2_fe1n', 'ge3i_wu2_me4ng_he2_jia1_2_fe1n', 'ge3i_xu3_yu2n_la2n_jia1_2_fe1n', 'ge3i_che2n_jia4n_fe1ng_jia1_3_fe1n', 'ge3i_zha1ng_ma4o_fe1ng_jia1_3_fe1n', 'ge3i_zha1ng_jia4n_ho2ng_jia1_3_fe1n', 'ge3i_lu4_li4_we3i_jia1_3_fe1n', 'ge3i_wa2ng_jia1_qi2_jia1_3_fe1n', 'ge3i_su1n_we2n_mi2ng_jia1_3_fe1n', 'ge3i_wu2_ha4n_qi1ng_jia1_3_fe1n', 'ge3i_hua2ng_jie2_jia1_3_fe1n', 'ge3i_hua2ng_o1u_li2n_jia1_3_fe1n', 'ge3i_tu2_ba3o_hua2_jia1_3_fe1n', 'ge3i_li3_xi1n_hua2_jia1_4_fe1n', 'ge3i_he2_xia3o_yi3ng_jia1_4_fe1n', 'ge3i_zhe4ng_che2ng_qia1ng_jia1_4_fe1n', 'ge3i_nie4_xia4_jie2_jia1_4_fe1n', 'ge3i_yu2_xia3o_mia2o_jia1_4_fe1n', 'ge3i_zhe4ng_zhi4_xio2ng_jia1_4_fe1n', 'ge3i_zo1u_de2_guo2_jia1_4_fe1n', 'ge3i_zha1ng_rui4_hua2i_jia1_4_fe1n', 'ge3i_chu3_wa3n_li2n_jia1_4_fe1n', 'ge3i_bia4n_xia3o_ji3n_jia1_4_fe1n', 'ge3i_wu2_shi4_ta2ng_jia1_5_fe1n', 'ge3i_ke1_cha1o_e2_jia1_5_fe1n', 'ge3i_li3_ya2n_jia1_5_fe1n', 'ge3i_wa4n_do1ng_do1ng_jia1_5_fe1n', 'ge3i_li3_xia3o_we4i_jia1_5_fe1n', 'ge3i_li2n_zhi4_bi1n_jia1_5_fe1n', 'ge3i_pa1n_de1ng_jia1_5_fe1n', 'ge3i_wu2_me4ng_he2_jia1_5_fe1n', 'ge3i_xu3_yu2n_la2n_jia1_5_fe1n', 'ge3i_li3_ju4n_ya4n_jia1_5_fe1n', 'ge3i_zha1ng_ma4o_fe1ng_jia1_10_fe1n', 'ge3i_zha1ng_jia4n_ho2ng_jia1_10_fe1n', 'ge3i_lu4_li4_we3i_jia1_10_fe1n', 'ge3i_wa2ng_jia1_qi2_jia1_10_fe1n', 'ge3i_su1n_we2n_mi2ng_jia1_10_fe1n', 'ge3i_wu2_ha4n_qi1ng_jia1_10_fe1n', 'ge3i_hua2ng_jie2_jia1_10_fe1n', 'ge3i_hua2ng_o1u_li2n_jia1_10_fe1n', 'ge3i_tu2_ba3o_hua2_jia1_10_fe1n', 'ge3i_wa2ng_qua2n_qua2n_jia1_10_fe1n']


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
