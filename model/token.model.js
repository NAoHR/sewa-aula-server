const mongoose = require("mongoose");

const TokenScheme = mongoose.Schema({
    tokenId : {
        type : String,
        require : true,
        unique : true
    }
});

module.exports = mongoose.model("token",TokenScheme);