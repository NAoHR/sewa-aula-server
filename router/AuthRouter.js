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

router.post("/loggedIn", isUserLoggedIn , (req,res) => {
    return res.json(req.user);
});

module.exports = router;