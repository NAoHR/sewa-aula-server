const mongoose = require("mongoose");
const Paket = require("./paket.model");


const OrderScheme = mongoose.Schema({
    paketId : {
        type : mongoose.ObjectId,
        required :  [true, "kolom paketId harus di isi"]
    },
    namaAcara : {
        type : String,
        required :  [true, "kolom namaAcara harus di isi"]
    },
    tipeOrderan : {
        type : String,
        enum : ["plain","paket"]
    },
    atasNama : {
        type : String,
        required : [true, "kolom atasNama harus di isi"],
        maxLength : 300,
    },
    email : {
        type : String,
        required : [true, "kolom email harus di isi"],
        maxLength : 100,
    },
    whatsapp : {
        type : String,
        required : [true, "kolom whatsapp harus di isi"],
        maxLength : 15,
    },
    jumlahPorsi : {
        type : Number,
        min : 30,
        required: function () {
            return this.tipeOrderan === "paket";
        }
    },
    tanggal : {
        type : Date,
        unique : true,
        required : [true, "kolom tanggal harus di isi"]
    },
    status : {
        type : String,
        enum : ["order","selesai","batal","paid"],
        required : [true, "kolom status harus di isi"]
    },
    createdAt : {
        type : Date,
        required : true
    }
})

OrderScheme.pre("updateOne",async function(next){
    const doc = await this.model.findOne(this.getQuery());
    
    let {paketId,tipeOrderan} = this._update;
    if(paketId || tipeOrderan){
        try{
            let paketDoc = await Paket.findById(paketId);
            if(paketDoc){
                let validator = tipeOrderan === "plain" ? true : false;
                if(paketDoc.paketPlain === validator){
                    if(paketDoc.paketPlain === true){
                        doc.tipeOrderan = "plain"
                        doc.jumlahPorsi = undefined;
                        doc.save();
                        return next();
                    }else{
                        this._update.tipeOrderan = "paket";
                        if(this._update.jumlahPorsi === undefined){
                            return next(new Error("jumlah porsi harus di isi"));
                        }
                        doc.jumlahPorsi = this._update.jumlahPorsi;
                        doc.save();
                        return next()
                    }
                }else{
                    return next(new Error("jika ingin mengganti paket, tipeOrderan dan paketId harus bernilai sama\ncontoh : paketPlain === true harus sama dengan tipeOrderan === plain"))    
                }
            }else{
                return next(new Error("jika ingin mengganti paket, masukkan juga paketId"))
            }
        }catch(e){
            return next(new Error(e.message))
        }
    }
    return next()
})

OrderScheme.post("init", async function(doc){
    try{
        const netDate = new Date().setHours(0,0,0,0);
        const createdDate = new Date(doc.tanggal).getTime();
        if(netDate - createdDate > 172800000){
            if(["batal","selesai","paid"].indexOf(doc.status) == -1){
                console.log(doc)
                doc.status = "batal";
                await doc.save();
            }
        }
        return doc
    }catch(e){
        return false
    }
})
module.exports = mongoose.model("OrderProduct",OrderScheme);