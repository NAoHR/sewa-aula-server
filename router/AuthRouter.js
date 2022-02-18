const express = require("express");
require("dotenv").config();
const {
    authVerifLogin,generateRefreshToken,isUserLoggedIn
} = require("../utils/authMiddleware/authMiddleware");

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

router.post("/refreshToken",generateRefreshToken, (req,res) => {
    try{
        return res.status(200).json(
            {
                ok : true,
                accessToken : req.newAccessToken
            }
        );
    }catch(e){
        return res.json({
            ok : false,
            message : "internal error"
        })
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
        return res.json({
            ok : false,
            message : "internal error"
        })
    }
})

router.post("/loggedIn", isUserLoggedIn , (req,res) => {
    try{
        return res.json(req.user);
    }catch(e){
        return res.status(500).json({
            ok : false,
            message : "internal error"
        })
    }
});

module.exports = router;