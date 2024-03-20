const videoEl = document.querySelector("#my-video");
let stream = null;
let mediaStream = null;

const constraints = {
    audio: true,
    // video: true,
    // video: { width: 1280, height: 720 },
    // video: {
    //     width: { min: 1280 },
    //     height: { min: 720 },
    // },
    video: {
        width: { min: 1024, ideal: 1280, max: 1920 },
        height: { min: 576, ideal: 720, max: 1080 },
    },
}

const getMicAndCamera = async(e)=>{
    try {
        stream = await navigator.mediaDevices.getUserMedia(constraints)
        changeButtons(['green','blue','blue','grey','grey','grey','grey','grey'])
    } catch (error) {
        console.log("User denied access to constraints: ", error)
    }
}

const showMyFeed = (e) => {
    if(stream) {
        videoEl.srcObject = stream
        changeButtons(['green','green','blue','blue','blue','grey','grey','blue'])
    }
}

const stopMyFeed = (e) => {
    if(stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track =>{
            track.stop()
        })
        changeButtons(['blue','grey','grey','grey','grey','grey','grey','grey'])
    }
}

document.querySelector("#share").addEventListener("click", e => getMicAndCamera(e))
document.querySelector("#show-video").addEventListener("click", e => showMyFeed(e))
document.querySelector("#stop-video").addEventListener("click", e => stopMyFeed(e))
document.querySelector("#change-size").addEventListener("click", e => changeVideoSize())
document.querySelector("#start-record").addEventListener("click", e => startRecording())
document.querySelector("#stop-record").addEventListener("click", e => stopRecording())
document.querySelector("#play-record").addEventListener("click", e => playRecording())
document.querySelector("#share-screen").addEventListener("click", e => shareScreen())

document.querySelector("#audio-input").addEventListener("click", e => changeAudioInput(e))
document.querySelector("#audio-output").addEventListener("click", e => changeAudioOutput(e))
document.querySelector("#video-input").addEventListener("click", e => changeVideoInput(e))