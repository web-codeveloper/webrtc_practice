const fs = require("fs")
const https = require('https')
const express = require('express');
const app = express();
const socketIo = require('socket.io')

app.use(express.static(__dirname))

const key = fs.readFileSync('create-cert-key.pem')
const cert = fs.readFileSync('create-cert.pem')

const expressServer = https.createServer({ key, cert }, app);
const io = socketIo(expressServer);

expressServer.listen(8181, () => {
    console.log("Server is running on https://localhost:8181");
});

// offers will contain {}
const offers = [
    // offererUserName
    // offer
    // offerIceCandidates
    // answererUserName
    // answer
    // answerIceCandidates
]

const connectedSocket = [
    // userName
    // socketId
]

io.on("connection", (socket) => {
    const userName = socket.handshake.auth.userName
    const password = socket.handshake.auth.password

    if (password != "x") {
        socket.disconnect(true)
        return
    }

    connectedSocket.push({
        socketId: socket.id,
        userName
    })

    if(offers.length){
        socket.emit("availableOffers", offers)
    }

    socket.on("newOffer", newOffer => {
        offers.push({
            offererUserName: userName,
            offer: newOffer,
            offerIceCandidates: [],
            answererUserName: null,
            answer: null,
            answerIceCandidates: []
        })
        // send out to all connected sockets except the caller
        socket.broadcast.emit("newOfferAwaiting", offers.slice(-1))
    })

    socket.on("newAnswer", (offerObj, ackFunction)=>{
        const socketToAnswer = connectedSocket.find(s => s.userName == offerObj.offererUserName);
        if(!socketToAnswer){
            console.log("No matching socket");
            return;
        }
        const socketIdToAnswer = socketToAnswer.socketId;
        const offerToUpdate = offers.find(offer => offer.offererUserName == offerObj.offererUserName);
        if(!offerToUpdate){
            console.log("No offer to update");
            return
        }

        // send back to the answerer all the iceCandidates we have already collected
        ackFunction(offerToUpdate.offerIceCandidates)
        offerToUpdate.answer = offerObj.answer
        offerToUpdate.answererUserName = userName
        socket.to(socketIdToAnswer).emit("answerResponse", offerToUpdate)
    })

    socket.on("sendIceCandidateToSignalingServer", iceCandidateObj=>{
        const {iceCandidate, iceUserName, didIOffer} = iceCandidateObj;

        if(didIOffer){
            // this ice is coming from the offerer. send to the answerer

            const offerInOffers = offers.find(o=>o.offererUserName === iceUserName);
            if(offerInOffers){
                offerInOffers.offerIceCandidates.push(iceCandidate)
                // When the answerer answers, all existing ice candidates are send
                // Any candidates thats come in after the offer has been answered, will be passed through
                if(offerInOffers.answererUserName){
                    // Pass it through to the other socket
                    const socketToSend = connectedSocket.find(s=>s.userName == offerInOffers.answererUserName)
                    if(socketToSend && socketToSend.socketId){
                        socket.to(socketToSend.socketId).emit("receivedIceCandidateFromServer", iceCandidate)
                    }else{
                        console.log("Ice candidate received but could not find answerer");
                    }
                }
            }

        }else{
            // this ice is coming from the answerer. send to the offerer
            // Pass it through to the other socket
            const offerInOffers = offers.find(o=>o.answererUserName == iceUserName)
            const socketToSend = connectedSocket.find(s=>s.userName == offerInOffers.offererUserName)
            if(socketToSend && socketToSend.socketId){
                socket.to(socketToSend.socketId).emit("receivedIceCandidateFromServer", iceCandidate)
            }else{
                console.log("Ice candidate received but could not find offerer");
            }
        }
    })
})