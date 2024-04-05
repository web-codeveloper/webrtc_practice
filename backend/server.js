const fs = require("fs")
const https = require("https")
const express = require("express")
const socketIo = require("socket.io")
const cors = require('cors');

const app = express()
app.use(cors());
app.options('*', cors());
app.use(express.static(__dirname+'/public'))

const key = fs.readFileSync('./certs/create-cert-key.pem')
const cert = fs.readFileSync('./certs/create-cert.pem')

const expressServer = https.createServer({ key, cert }, app);
const io = socketIo(expressServer, {
    cors: ['https://localhost:3000', 'https://localhost:3001', 'https://localhost:3002']
});

expressServer.listen(9000, () => {
    console.log("Server is running on https://localhost:9000");
});

module.exports = { io, expressServer, app }