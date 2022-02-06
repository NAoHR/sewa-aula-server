const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
require("dotenv").config();

const {Admin} = require("../../model/admin.model");


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
                const refreshToken = await findUser.createAccessToken();
                const accessToken = await findUser.createRefreshToken();
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
        console.log(err);
        if(err.name == "JsonWebTokenError"){
            return res.status(401).json({
                ok : false,
                message : "not authorized"
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


module.exports = {
    authVerifLogin,
    authorizeUser,
    superAdminOnly
}