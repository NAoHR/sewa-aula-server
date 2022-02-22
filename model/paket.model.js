const mongoose = require("mongoose");

const DCScheme = new mongoose.Schema({
    gambar : {
        type : String,
        required : [true,"gambar tidak ada"],
    },
    hargaPerBuah : {
        type : Number,
        required : [true,"harga per buah tidak ada"]
    },
    detailPaketCatering : {
        type : [{
            type : String,
            maxLength : 300,
            required : true
        }],
        required : [true,"detail paket catering tidak ada"],
    }
})

const Paket = mongoose.Schema({
    paketPlain : {
        type : Boolean,
        required : [true, "kolom paketPlain harus di isi"]
    },
    namaPaket : {
        type : String,
        unique : true,
        maxLength : 300,
        required : [true, "kolom namaPaket harus di isi"]
    },
    hargaAula : {
        type : Number,
        required : [true, "kolom hargaAula harus di isi"]
    },
    deskripsi : {
        type : String,
        maxLength : 300,
        required : [true, "kolom deskripsi harus di isi"],
    },
    detailCatering : {
        type : DCScheme, 
        required : function () {return this.paketPlain === false}
    }
})


Paket.pre("updateOne", async function(next) {
    const doc = await this.model.findOne(this.getQuery());
    let paketPlain = this._update.paketPlain;
    
    if(paketPlain === false){
        if(this._update.detailCatering === undefined){
            return next(new Error("jika ingin menganti tipe paket untuk tidak plain, harap masukkan detailCatering"))
        }else{
            return next()
        }
    }else if (paketPlain === true && doc.paketPlain === false){
        this._update.detailCatering = undefined;
        doc.paketPlain = true;
        doc.detailCatering = undefined;
        await doc.save();
        return next();
    }else{
        this._update.detailCatering = undefined
        return next()
    }
})

Paket.pre("save", function(next){
    const {
        paketPlain,namaPaket,hargaAula,deskripsi
    } = this;
    if([paketPlain,namaPaket,hargaAula,deskripsi].indexOf(undefined) === -1){
        return next();
    }
    return next(new Error("komponen utama tidak diisi dengan benar"));
})

module.exports = mongoose.model("pakets",Paket);