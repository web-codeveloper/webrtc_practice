const supportConstraints = navigator.mediaDevices.getSupportedConstraints()

const changeVideoSize = () => {
    stream.getVideoTracks().forEach(track => {
        const capabilities = track.getCapabilities();
        const height = document.querySelector("#vid-height").value
        const width = document.querySelector("#vid-width").value

        const videoConstraints = {
            height: {exact: height < capabilities.height.max ? height : capabilities.height.max},
            width: {exact: width < capabilities.width.max ? width : capabilities.width.max}
        }
        track.applyConstraints(videoConstraints)
    })
}