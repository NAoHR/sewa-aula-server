const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const {
    authVerifLogin,authorizeUser,superAdminOnly,generateRefreshToken
} = require("../utils/authMiddleware/authMiddleware");

const {
    Admin
} = require("../model/admin.model");

const Token = require("../model/token.model");

const router = express.Router();

router.post("/login", authVerifLogin,async (req,res) => {
    try{
        return res.json(req.afterVerify);
    }catch(Err){
        console.log(Err);
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
            await createAdmin.save();

            const accessToken = await createAdmin.createAccessToken();
            const refreshToken = await createAdmin.createRefreshToken()

            if(!accessToken || !refreshToken){
                return res.status(500).status({
                    ok : false,
                    message : "internal error"
                })
            }
            return res.status(200).json({
                ok : true,
                accessToken : accessToken,
                refreshToken : refreshToken
            })
        }catch(e){
            console.log(e);
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

router.post("/refreshToken",generateRefreshToken, (req,res) => {
    try{
        return res.status(200).json(
            {
                accessToken : req.newAccessToken
            }
        );
    }catch(e){
        console.log(e)
    }
})

router.delete("/logout",async (req,res) => {
    try{
        const {refreshToken} = req.body;
        if(refreshToken){
            let tokenDocs = await Token.findOneAndDelete({
                tokenId : refreshToken
            })
            if(tokenDocs !== null){
                return res.status(200).json({
                    ok : true,
                    message : "logout berhasil"
                })
            }
            return res.status(400).json({
                ok : false,
                message : "token tidak ditemukan"
            })
        }
        return res.send("please insert tokenb");
    }catch(e){
        console.log(e);
        return res.send("not ok")
    }
})

module.exports = router;