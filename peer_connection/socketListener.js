let allOffers = []
// on connection get all available offers and call createOfferEls
socket.on("availableOffers",offers=>{
    createOfferEls(offers)
})

// someone just made a new offer and we're already here - call createOfferEls
socket.on("newOfferAwaiting",offers=>{
    createOfferEls(offers)
})

socket.on("answerResponse", offerObj=>{
    console.log(offerObj);
    addAnswer(offerObj)
})

socket.on("receivedIceCandidateFromServer", iceCandidate=>{
    console.log(iceCandidate);
    addNewIceCandidate(iceCandidate);
})

function createOfferEls(offers){
    allOffers = offers
    // make answer button for this new offer
    const answerEl = document.querySelector("#answer");
    offers.forEach(offer=>{
        const newOfferEl = document.createElement("div")
        newOfferEl.innerHTML = `<button class="btn btn-success col-1 answerButton" id="${offer.offererUserName}">Answer ${offer.offererUserName}</button>`
        // newOfferEl.addEventListener("click",()=>answerOffer(offer))
        // console.log(newOfferEl);
        answerEl.appendChild(newOfferEl)
    })
}

$(document).ready(function(){
    $("#answer").on("click", ".answerButton", function(){
        const offerObj = allOffers.find(offer => offer.offererUserName == $(this).attr("id"))
        answerOffer(offerObj)
    })
})