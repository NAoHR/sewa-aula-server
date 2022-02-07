const mongoose = require("mongoose");

const Paket = mongoose.Schema({
    paketPlain : {
        type : Boolean,
        required : [true, "kolom paketPlain harus di isi"]
    },
    namaPaket : {
        type : String,
        maxLength : 300,
        required : [true, "kolom namaPaket harus di isi"]
    },
    gambar : {
        type : String,
        required : [true, "kolom gambar harus di isi"],
    },
    hargaAula : {
        type : Number,
        required : [true, "kolom hargaAula harus di isi"]
    },
    deskripsi : {
        type : String,
        maxLength : 300,
        required : [true, "kolom deskripsi harus di isi"]
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