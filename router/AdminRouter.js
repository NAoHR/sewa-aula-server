const express = require("express");
const Paket = require("../model/paket.model");
const router = express.Router();

const {
    authorizeUser
} = require("../utils/authMiddleware/authMiddleware");

router.post("/tambahpaket", authorizeUser, async (req,res) => {
    try{
        const body = req.body;
        const tambahPaket = new Paket({
            paketPlain : body.paketPlain,
            namaPaket : body.namaPaket,
            hargaAula : Number(body.hargaAula),
            gambar : body.gambar,
            deskripsi : body.deskripsi,
            detailCatering : body.paketPlain === true ? undefined : {
                hargaPerBuah : Number(body.detailCatering.hargaPerBuah) === NaN ? undefined : Number(body.detailCatering.hargaPerBuah),
                detailPaketCatering : body.detailCatering.detailPaketCatering
            }
        });
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