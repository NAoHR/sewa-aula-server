const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
require("dotenv").config();

const {Admin} = require("../../model/admin.model");
const Token = require("../../model/token.model")

const authVerifLogin = async (req,res,next) => {
    const {username,password} = req.body;
    if(username !== undefined && password !== undefined){
        try{
            const findUser = await Admin.findOne({username : username})
            if(findUser == null){
                return res.status(501).json({
                    "ok" : false,
                    "message" : "user tidak terdaftar di database"
                });
            }
            const isPasswordMatchToHas = await bcrypt.compare(password,findUser.password);
            if(isPasswordMatchToHas){
                const accessToken = await findUser.createAccessToken();
                const refreshToken = await findUser.createRefreshToken();
                req.afterVerify = {
                    "accessToken" : accessToken,
                    "refreshToken" : refreshToken,
                };
                return next();
            }
            return res.status(403).json({
                "ok" : false,
                "message" : "tidak memenuhi kriteria username ataupun password"
            });
        }catch(Err){
            return res.status(400).json({
                ok : false,
                "message" : "server tidak berjalan"
            });
        }
    }
    return res.status(403).json({
        ok : false,
        message : "tidak memenuhi kriteria"
    });
}


const authorizeUser = async (req,res,next) => {
    try{
        if(req.headers.jwt === undefined){
            return res.status(403).json({
                ok : false,
                message : "dilarang"
            })
        }
        const verifyIt = await jwt.verify(req.headers.jwt,process.env.SECRET_ACCESS_KEY)
        req.detailUser = verifyIt;
        next();
    }catch(err){
        if(err.name === "JsonWebTokenError"){
            return res.status(401).json({
                ok : false,
                message : "not authorized"
            })
        }else if(err.name === "TokenExpiredError"){
            return res.status(401).json({
                ok : false,
                message : "token expired"
            })
        }
        return res.status(500).json({
            ok : false,
            message : "server error"
        })
    }
}

const superAdminOnly = async (req,res,next) => {
    const {id} = req.detailUser;
    try{
        const getDetailfromID = await Admin.findById(id);
        if(getDetailfromID.role == "super_admin"){
            return next();
        }
        return res.status(401).json({
            ok : false,
            message : "not allowed"
        })
    }catch(Err){
        console.log(Err);
        return res.send("error occured");
    }
}

const generateRefreshToken = async (req,res,next) => {
    const {refreshToken} = req.body;
    if(!refreshToken){
        return res.status(404).json({
            ok : false,
            message : "token missing"
        })
    }
    const getRefreshToken = await Token.findOne({tokenId : refreshToken});
    if(!getRefreshToken){
        return res.status(401).json({
            ok : false,
            message : "token not found, please login again"
        })
    }
    try{
        const payload = await jwt.verify(getRefreshToken.tokenId,process.env.SECRET_REFRESH_KEY);
        const newAccessToken = await jwt.sign({
            id : payload.id,
            username : payload.username
        },process.env.SECRET_ACCESS_KEY,{
            expiresIn : "10m"
        });
        req.newAccessToken = newAccessToken;
        return next()

    }catch(e){
        if(e.name == "TokenExpiredError"){
            await Token.deleteOne({tokenId : getRefreshToken.tokenId});
            return res.status(401).json({
                ok : false,
                message : "refresh token expired, please login again"
            })
        }else{
            return res.status(500).json({
                ok : false,
                message : "internal server error"
            })
        }
    }

}

module.exports = {
    authVerifLogin,
    authorizeUser,
    superAdminOnly,
    generateRefreshToken,
}