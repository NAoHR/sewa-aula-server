const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const {
    authVerifLogin,authorizeUser,superAdminOnly
} = require("./utils/authMiddleware/authMiddleware");

const {
    Admin
} = require("./model/admin.model");

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({extended : true}));


app.post("/addAdmin", authorizeUser , superAdminOnly ,async (req,res) =>{
    const { username, password,role } = req.body;
    if(username !== undefined && password !== undefined && role !== undefined){
        try{
            const newPassword = await bcrypt.hash(password,10);
            const createAdmin = new Admin({
                username : username,
                password : newPassword,
                role : role,
            })
            const saveIt = await createAdmin.save();
            return res.status(200).json({
                "ok" : true
            })
        }catch(e){
            if(e.message.split(":")[0] === "E11000 duplicate key error collection"){
                return res.status(500).json({
                    ok : false,
                    message : "username sudah terdaftar"
                })
            }
            return res.status(500).json({
                ok : false,
                message : "server error"
            })
        }
    }
    res.json({
        ok : false,
        message : "tidak valid"
    })
})

app.post("/login", authVerifLogin,async (req,res) => {
    try{
        const token = await jwt.sign(req.afterVerify,process.env.SECRET_KEY);
        return res.json({
            ok : true,
            token : token
        })
    }catch(Err){
        return res.json({
            ok : false,
            message : "server error"
        })
    }
})

mongoose.connect(process.env.LOCAL_DEV_MONGO
    )
    .then(()=>{
        console.log("mongodb connected")
        app.listen(5000, () =>{
            console.log("express server started");
        })
    })
    .catch((err)=>{
        console.log(err);
    })