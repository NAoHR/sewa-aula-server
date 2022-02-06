const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Token = require("./token.model")
require("dotenv").config();


const AdminScheme = mongoose.Schema({
    username : {
        type : String,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    role : {
        type : String,
        enum : ["admin","super_admin"],
        required : true
    },
})
AdminScheme.methods = {
    createAccessToken : async function () {
        try{
            const {_id,username} = this;
            let AccessToken = await jwt.sign({
                username : username,
                id : _id
            },process.env.SECRET_ACCESS_KEY,{
                expiresIn : "10m"
            });
            return AccessToken;
        }catch(err){
            return false
        }
    },
    createRefreshToken : async function () {
        try{
            const {_id,username} = this;
            let RefreshToken = await jwt.sign({
                username : username,
                id : _id
            },process.env.SECRET_REFRESH_KEY,{
                expiresIn : "2d"
            });
            const saveToToken = new Token({
                tokenId : RefreshToken
            })
            await saveToToken.save();
            return RefreshToken
        }catch(e){
            return false;
        }
        
    }
}

const Admin = mongoose.model("Admin",AdminScheme);

module.exports = {
    Admin
}