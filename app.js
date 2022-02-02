require('dotenv').config();
require('./config/database').connect();

const express = require('express');
const bcrypt = require("bcrypt");
const User = require('./model/user');
const Container = require('./model/containerId')
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth')
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(express.json());
app.use(cors()); 
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const enryptRound = 10;

app.post('/register', async(req, res) => {
    console.log(req.body)
    const { firstName, lastName, email, password, photo, containerCode } = req.body;

    if(!(firstName && lastName && email && password && containerCode)){
        const errorReply =  {
            registerStatus: false,
            text:"firstname lastname email password and containerCode must not empty"
        }
        res.status(400).send(errorReply);
    }
    try{
        const oldUser = await User.findOne({email});
        const isContaner = await Container.findOne({containerCode});

        console.log(oldUser, isContaner, !(isContaner))

        if(oldUser){
            const errorReply  = {
                registerStatus: false,
                text: "This email alreadly register."
            }
            res.status(409).send(errorReply);
        }
        else if(!isContaner){
            const errorReply = {
                registerStatus: false,
                text: "Invalid contaner code."
            }
            res.status(409).send(errorReply)          
        }
        else{
            const hashPassword = bcrypt.hashSync(password, enryptRound);

            await User.create({
                first_name: firstName,
                last_name: lastName,
                email: email,
                container_code: containerCode,
                password: hashPassword,
                photo: photo
            })
            const replyText = {
                registerStatus: true, 
                text: "register success."
            }
            res.status(200).send(replyText)
        }

    }catch(err){
        const errorReply = {
            registerStatus: false,
            text: "Invalid contaner code."
        }
        res.status(409).send(errorReply)
    }
})


app.post('/userprofile', async(req, res) => {
    
    const {email, password} = req.body

    try{
        if(!(email && password)){
            res.status(400).send("email and password must not be empty")
        }

        const isLogin = await User.findOne({email})
        if(isLogin && (await bcrypt.compare(password, isLogin.password))){
            const genToken = jwt.sign(
                {user_id: isLogin._id, email},
                process.env.TOKEN_KEY,
                {expiresIn: "1h"}
            )
            const replyUser = {
                statusLogin: true,
                statusDesc: "login success",
                firstname: isLogin.first_name,
                lastname: isLogin.last_name,
                email: isLogin.email,
                photo: isLogin.photo
            }
            replyUser.token =  genToken
            res.status(201).send(replyUser)
        }else{
            const setSendingData = {
                statusLogin: false,
                statusDesc: "Invalid email or password",
            } 
            res.send(setSendingData);
        }
    }catch(err){
        console.log(err)
        const setSendingData = {
            statusLogin: false,
            statusDesc: "login is expires please login agian."
        }
        res.send(setSendingData)
    }
})


app.put('/updateprofile', auth, async(req, res) => {
    const {firstName, lastName, email, password, photo} = req.body;
    const hashPassword = bcrypt.hashSync(password, enryptRound);

    const myquery = { email: email };
    const newvalues = {first_name: firstName, last_name: lastName, password: hashPassword, photo: photo};
    await User.updateOne(myquery, newvalues).then((result)=>{
        // console.log(result)
        res.send("Update success")
    }).catch((err)=>{
        const replyText = {
            statusLogin: false,
            text:"please login to access this pages."
        }
        console.log(err)
        res.send(replyText)
    })
})



module.exports = app;