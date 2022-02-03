const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const dummyUser = [
    {
        id : "09132871429",
        username: 'najmi',
        password: '$2b$10$FVxrp2ujcp2uu1iZBh5ypecqlIitkezptc9t1pSO99GprzHEtkxM2'
    }
];

const authVerifLogin = async (req,res,next) => {
    const {username,password} = req.body;
    if(username !== undefined && password !== undefined){
        try{
            const findUser = dummyUser.find(item => item.username == username);
            if(findUser == null){
                return res.status(501).json({
                    "ok" : false,
                    "message" : "tidak terdaftar di database"
                });
            }
            const isPasswordMatchToHas = await bcrypt.compare(password,findUser.password);
            if(isPasswordMatchToHas){
                req.afterVerify = {
                    "id" : findUser.id,
                    "username" : findUser.username,
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
        const verifyIt = await jwt.verify(req.headers.jwt,process.env.SECRET_KEY)
        req.detailUser = verifyIt;
        next();
    }catch(err){
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
module.exports = {
    authVerifLogin,
    authorizeUser
}