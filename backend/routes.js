
const app = require('./server').app;
const jwt = require('jsonwebtoken');
const linkSecret = "sdsidomgs8oumgsdhogys8678ys8dyfu";
const { v4: uuidv4 } = require('uuid');

//normally this would be persistent data... db, api, file, etc.
const professionalAppointments = [{
    professionalsFullName: "Partha Mandal",
    apptDate: Date.now(),
    uuid:1,
    clientName: "John Doe",
},{
    professionalsFullName: "Partha Mandal",
    apptDate: Date.now() - 2000000,
    uuid:2,// uuid:uuidv4(),
    clientName: "Brian Red",
},{
    professionalsFullName: "Partha Mandal",
    apptDate: Date.now() + 10000000,
    uuid:3,//uuid:uuidv4(),
    clientName: "Lisa Doe",
}];

app.set('professionalAppointments',professionalAppointments)

//this route is for US! In production, a receptionist, or calender/scheduling app
//would send this out. We will print it out and paste it in. It will drop
//us on our React site with the right info for CLIENT1 to make an offer
app.get('/user-link',(req, res)=>{

    const apptData = professionalAppointments[0];

    professionalAppointments.push(apptData);

    //we need to encode this data in a token
    //so it can be added to a url
    const token = jwt.sign(apptData,linkSecret);
    res.send('https://localhost:3000/join-video?token='+token);
    // res.json("This is a test route")
})  

app.get('/validate-link',(req, res)=>{
    //get the token from the body of the post request (  thanks express.json() )
    const token = req.query.token;
    //decode the jwt with our secret
    const decodedData = jwt.verify(token,linkSecret);
    //send the decoded data (our object) back to the front end
    res.json(decodedData)
})

app.get('/pro-link',(req, res)=>{
    const userData = {
        fullName: "Partha Mandal",
        proId: 1234,
    }
    const token = jwt.sign(userData,linkSecret);
    res.send(`<a href="https://localhost:3000/dashboard?token=${token}" target="_blank">Link Here</a>`);
})