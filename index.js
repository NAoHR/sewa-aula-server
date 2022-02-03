const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const {
    authVerifLogin,authorizeUser
} = require("./utils/authMiddleware/authMiddleware");

const {BaseProduct} = require("./model/order.model");

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({extended : true}));


app.post("/", async (req,res)=>{
    try{
        console.log(req.body)
        const newData = new BaseProduct({name : req.body.name});
        console.log(newData);
        // await newData.save();
        return res.json({
            ok : true
        })
    }catch(e){
        console.log(e);
        return res.status(500).json({
            dbStatus : false
        })
    }
})

app.post("/register", async (req,res) =>{
    const {username, password} = req.body;
    if(username !== undefined && password !== undefined){
        try{
            const newPassword = await bcrypt.hash(password,10);
            dummyUser.push({
                "username" : username,
                "password" : newPassword
            })
            console.log(dummyUser);
            return res.status(200).json({
                "ok" : true
            })
        }catch(Err){
            console.log(Err)
        }
    }
    res.json({
        zamn : "ok"
    })
})

app.get("/testing", authorizeUser ,(req,res)=>{
    console.log(req.detailUser);
    res.send(req.detailUser);
})

app.post("/login", authVerifLogin,async (req,res) => {
    try{
        const token = await jwt.sign(req.afterVerify,process.env.SECRET_KEY);
        return res.json({
            ok : true,
            token : token
        })
    }catch(Err){
        console.log(Err);
        return res.json({
            zamn : "asd"
        })
    }
})
// mongoose.connect(process.env.LOCAL_DEV_MONGO
//     )
//     .then(()=>{
//         console.log("run")
//         app.listen(5000, () =>{
//             console.log("app run");
//         })
//     })
//     .catch((err)=>{
//         console.log(err);
//     })

app.listen(5000, () =>{
    console.log("run");
})