const path = require("path")
const express = require("express")
const app = express()

app.use(express.static(path.join(__dirname)))
app.listen(3000, ()=>{
    console.log("Server is running on http://localhost:3000")
})