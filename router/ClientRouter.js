const express = require("express");

const Order = require("../model/order.model");
const Paket = require("../model/paket.model")
const router = express.Router("/");


router.post("/order/:paketId", async (req,res) => {
    try{
        const {paketId} = req.params;
        const paketDoc = await Paket.findById(paketId);
        console.log(paketDoc);
        if(paketDoc){
            const detail = req.body;
            const orderan = new Order({
                paketId : paketId,
                tipeOrderan : paketDoc.paketPlain === true ? "plain" : "paket",
                atasNama : detail.atasNama,
                email : detail.email,
                whatsapp : detail.whatsapp,
                jumlahPorsi : paketDoc.paketPlain === true ? undefined : detail.jumlahPorsi,
                tanggal : detail.tanggal,
                status : "order"
            })

            await orderan.save();
            
            return res.status(200).json({
                ok : true,
                message : "pesanan berhasil dimasukkan",
                PilihanPaket : paketDoc,
                detailPesanan : orderan
            })
        }
    }catch(e){
        if(e.name === "ValidationError"){
            return res.status(401).json({
                ok : false,
                message : e.message
            })
        }
    }
})

module.exports = router