
const shareScreen = async()=>{
    const options = {
        video: true,
        audio: false,
        surfaceSwitching: 'include'
    }

   try {
    mediaStream = await navigator.mediaDevices.getDisplayMedia(options)
    changeButtons(['green','green','blue','blue','green','green','green','green'])
   } catch (error) {
    console.log("Can't share screen: ", error)
   }
}