const express = require("express");
const Paket = require("../model/paket.model");
const router = express.Router();

const {
    authorizeUser
} = require("../utils/authMiddleware/authMiddleware");

router.post("/tambahpaket", authorizeUser, async (req,res) => {
    try{
        console.log(req.body);
        const tambahPaket = new Paket({
            paketPlain : req.body.paketPlain,
            namaPaket : req.body.namaPaket,
            hargaAula : Number(req.body.hargaAula),
            gambar : req.body.gambar,
            deskripsi : req.body.deskripsi,
            detailCatering : req.body.paketPlain === true ? undefined : {
                hargaPerBuah : Number(req.body.detailCatering.hargaPerBuah) === NaN ? undefined : Number(req.body.detailCatering.hargaPerBuah),
                detailPaketCatering : req.body.detailCatering.detailPaketCatering
            }
        });
        console.log(tambahPaket)
        await tambahPaket.save();
        return res.json({
            ok : true,
            message : "data berhasil ditambahkan"
        });
    }catch(e){
        console.log(e)
        if(e.name == "ValidationError" || e.name === "TypeError"){
            return res.status(401).json({
                ok : false,
                message : e.message
            })
        }else{
            res.status(500).json({
                ok : false,
                message : "internal error"
            })
        }
    }
})

module.exports = router;