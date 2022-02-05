const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
    authVerifLogin,authorizeUser,superAdminOnly
} = require("../utils/authMiddleware/authMiddleware");
const {
    Admin
} = require("../model/admin.model");

const router = express.Router();

router.post("/login", authVerifLogin,async (req,res) => {
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


router.post("/addAdmin", authorizeUser , superAdminOnly ,async (req,res) =>{
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

module.exports = router;