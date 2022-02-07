const mongoose = require("mongoose");

const Paket = mongoose.Schema({
    paketPlain : {
        type : Boolean,
        required : true
    },
    namaPaket : {
        type : String,
        maxLength : 300,
        required : true
    },
    hargaAula : {
        type : Number,
        required : true
    },
    deskripsi : {
        type : String,
        maxLength : 300,
        required : true
    },
    detailCatering : {
        hargaPerBuah : {
            type : Number,
            required : function () {return this.paketPlain === false}
        },
        detailPaketCatering : {
            type : [{
                type : String,
                maxLength : 300,
                required : function () {return this.paketPlain === false}
            }],
            required : function () {return this.paketPlain === false},
            default : undefined
        }
    }
})

module.exports = mongoose.model("pakets",Paket);