
const userName = "Partha-"+Math.floor(Math.random()*100000)
const password = "x";
document.querySelector("#user-name").innerHTML = userName;

const socket = io.connect("wss://192.168.0.128:8181/",{
    auth: {
        userName, password
    }
})
const localVideoEl = document.querySelector("#local-video")
const remoteVideoEl = document.querySelector("#remote-video")

let localStream;
let remoteStream;
let peerConnection;
let didIOffer = false;

let peerConfiguration = {
    iceServers:[
        {
            urls:[
              'stun:stun.l.google.com:19302',
              'stun:stun1.l.google.com:19302'
            ]
        }
    ]
}

const call = async e => {
    await fetchUserMedia()
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
    });
    localVideoEl.srcObject = stream
    localStream = stream

    await createPeerConnection();

    try {
        const offer = await peerConnection.createOffer();
        peerConnection.setLocalDescription(offer)
        didIOffer = true
        socket.emit("newOffer",offer)  // Send offer to signalingServer
    } catch (error) {
        console.log(error);
    }
}

const answerOffer = async(offerObj) => {
    console.log(offerObj);
    await fetchUserMedia();
    await createPeerConnection(offerObj);
    const answer = await peerConnection.createAnswer({});
    await peerConnection.setLocalDescription(answer)
    offerObj.answer = answer;
    const offerIceCandidates = await socket.emitWithAck("newAnswer", offerObj)
    offerIceCandidates.forEach(c=>{
        peerConnection.addIceCandidate(c)
        console.log("Ice candidate added");
    })
    console.log(offerIceCandidates);
}

const addAnswer = async (offerObj)=>{
    // addAnswer is called in socketListeners when an answerResponse is emitted
    // at this point, the offer and answer have been exchanged!
    await peerConnection.setRemoteDescription(offerObj.answer)
}

const fetchUserMedia = async()=>{
    return new Promise(async(resolve, reject)=>{
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            })
            localVideoEl.srcObject = stream;
            localStream = stream
            resolve()
        } catch (error) {
            console.log(error);
            reject()
        }
    })
}

const createPeerConnection = async(offerObj) => {
    return new Promise(async(resolve, reject)=>{
        try {
            // RTCPeerConnection is the thing that creates the connection
            // we can pass a config object, and that config object can contain stun servers
            // which will fetch us ICE candidates
            peerConnection = await new RTCPeerConnection(peerConfiguration);
            remoteStream = new MediaStream();
            remoteVideoEl.srcObject = remoteStream

            localStream.getTracks().forEach(track=>{
                // add local tracks so that they can be sent once the connection is established
                peerConnection.addTrack(track, localStream)
            })
            peerConnection.addEventListener('signalingstatechange', e=>{
                console.log(e);
                console.log(peerConnection.signalingState);
            })

            peerConnection.addEventListener('icecandidate', e=>{
                // console.log('Ice candidate found: ',e);
                if(e.candidate){
                    socket.emit("sendIceCandidateToSignalingServer",{
                        iceCandidate: e.candidate,
                        iceUserName: userName,
                        didIOffer
                    })
                }
            })

            peerConnection.addEventListener("track", e =>{
                console.log("Got a track from the other peer!!");
                console.log(e);
                e.streams[0].getTracks().forEach(track=>{
                    remoteStream.addTrack(track, remoteStream)
                })
            })

            if(offerObj){
                // this won't be set when called from call()
                // will be set when we call from answerOffer()
                await peerConnection.setRemoteDescription(offerObj.offer)
            }
            resolve()
        } catch (error) {
            console.log(error);
            reject()
        }
    })
}

const addNewIceCandidate = iceCandidate => {
    peerConnection.addIceCandidate(iceCandidate)
    console.log(iceCandidate);
}

document.querySelector("#call").addEventListener('click', call)