const mongoose = require("mongoose");

const AdminScheme = mongoose.Schema({
    username : {
        type : String,
        unique : true
    },
    password : String,
    role : String,
})

const Admin = mongoose.model("Admin",AdminScheme);

module.exports = {
    Admin
}