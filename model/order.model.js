const mongoose = require("mongoose");

const OrderScheme = mongoose.Schema({
    paketId : {
        type : mongoose.ObjectId,
        required :  [true, "kolom paketId harus di isi"]
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
        required: function () {
            return this.tipeOrderan === "paket";
        },
        default : undefined
    },
    tanggal : {
        type : Date,
        required : [true, "kolom tanggal harus di isi"]
    },
    status : {
        type : String,
        enum : ["order","selesai","batal","paid"],
        required : [true, "kolom status harus di isi"]
    },
})
module.exports = mongoose.model("OrderProduct",OrderScheme);