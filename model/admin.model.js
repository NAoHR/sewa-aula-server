const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Token = require("./token.model");
const bcrypt = require("bcrypt");

require("dotenv").config();


const AdminScheme = mongoose.Schema({
    username : {
        type : String,
        unique : true,
        required : [true, "username tidak ada"]
    },
    password : {
        type : String,
        required : [true, "password tidak ada"]
    },
    role : {
        type : String,
        enum : ["admin","super_admin"],
        required : [true, "role tidak ada"]
    },
})
AdminScheme.methods = {
    createAccessToken : async function () {
        try{
            const {_id,username,role} = this;
            let AccessToken = await jwt.sign({
                username : username,
                id : _id,
                role : role
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
            const {_id,username,role} = this;
            console.log(_id,username,role);
            let RefreshToken = await jwt.sign({
                username : username,
                id : _id,
                role : role
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

AdminScheme.pre("updateOne", async function(next){
    const {username , password, role} = this._update;
    if(password){
        this._update.password = await bcrypt.hash(password, 10);
        return next();
    }
    return next();
})

const Admin = mongoose.model("Admin",AdminScheme);

module.exports = {
    Admin
}