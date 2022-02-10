const express = require("express");

const Order = require("../model/order.model");
const Paket = require("../model/paket.model")
const router = express.Router("/");
const url = require('url');


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
        }else{
            res.json({
                ok : false,
                message : `tidak ada product dengan id ${paketId}`
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

router.get("/getOrder/:orderId",async (req,res)=>{
    try{
        const {orderId} = req.params;
        let orderDetail = await Order.findById(orderId);
        if(orderDetail){
            console.log(orderDetail,"sini");
            let paketfromOrder = await Paket.findById(orderDetail.paketId);
            return res.json({
                ok : true,
                orderDetail : orderDetail,
                paketfromOrder : paketfromOrder
            })
        }
        return res.json({
            ok : false,
            message : "orderan tidak ditemukan"
        })
    }catch(e){
        if(e.name === "CastError"){
            return res.json({
                ok : false,
                message : "orderan tidak ditemukan"
            })
        }
        return res.json({
            ok : false,
            message : "internal server error"
        })
    }
})

router.get("/getalldata", async (req,res) => {
    const urlParam = url.parse(req.url,true);
    const query = urlParam.query;
    try{
        let tobeReturned = {};
        const hideCreds = (data) => {
            if(data){
                return data.map((val)=>{
                    let hideEmail = val["email"].split("@")
                    return {
                        "_id": val._id,
                        "paketId": val.packetId,
                        "tipeOrderan": val.tipeOrderan,
                        "atasNama": val.atasNama,
                        "email": `${hideEmail[0].slice(0,2)}${"*".repeat(hideEmail[0].length -2)}@${hideEmail[1]}`,
                        "nomor" : val["whatsapp"],
                        "whatsapp": `${val["whatsapp"].slice(0,2)}${"*".repeat(val["whatsapp"].length -4)}${val["whatsapp"].slice(-2)}`,
                        "jumlahPorsi": val.porsi,
                        "tanggal": val.tanggal,
                        "status": val.status,
                    }
                })
            }
        }
        switch(query["q"]){
            case "paket":
                tobeReturned["paket"] = await Paket.find()
                break
            case "order":
                tobeReturned["order"] = hideCreds(await Order.find());
                break
            default:
                let paketDocs = await Paket.find();
                let orderdocs = hideCreds(await Order.find());
                tobeReturned = {
                    paket : paketDocs,
                    order : orderdocs
                }
                break
        }
        return res.json({
            ok : true,
            data : tobeReturned
        })
    }catch(e){
        console.log(e);
        return res.json({
            ok : false,
            message : "internal error"
        })
    }
})

module.exports = router