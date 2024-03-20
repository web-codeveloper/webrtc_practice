
let mediaRecorder;
let recordedBlobs;

const startRecording = () => {
    changeButtons(['green','green','blue','blue','green','blue','grey','blue'])
    recordedBlobs = []
    mediaRecorder = new MediaRecorder(stream);

    // Call when recording is stopped
    mediaRecorder.ondataavailable = e =>{
        recordedBlobs.push(e.data)
    }

    mediaRecorder.start()
}

const stopRecording = () => {
    changeButtons(['green','green','blue','blue','blue','green','blue','blue'])
    mediaRecorder.stop()
}

const playRecording = () => {
    changeButtons(['green','green','blue','blue','blue','blue','green','blue'])
    const superBuffer = new Blob(recordedBlobs);
    const recordedVideoEl = document.querySelector("#other-video")
    recordedVideoEl.src = window.URL.createObjectURL(superBuffer)
    recordedVideoEl.controls = true;
    recordedVideoEl.play()
}
