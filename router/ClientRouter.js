const express = require("express");

const Order = require("../model/order.model");
const Paket = require("../model/paket.model")
const router = express.Router();
const url = require('url');


router.post("/order/:paketId", async (req,res) => {
    try{
        const {paketId} = req.params;
        const paketDoc = await Paket.findById(paketId);

        if(paketDoc){
            const detail = req.body;
            const newDate = new Date(isNaN(Number(detail.tanggal)) ? detail.tanggal : Number(detail.tanggal)).setHours(0,0,0,0)

            const orderan = new Order({
                paketId : paketId,
                namaAcara : detail.namaAcara,
                tipeOrderan : paketDoc.paketPlain ? "plain" : "paket",
                atasNama : detail.atasNama,
                email : detail.email,
                whatsapp : detail.whatsapp,
                jumlahPorsi : paketDoc.paketPlain ? undefined : detail.jumlahPorsi,
                tanggal : newDate,
                status : "order",
                createdAt : new Date().toLocaleDateString({timeZone : "Asia/Jakarta"})
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
        if(e.name === "ValidationError" || e.name === "MongoServerError"){
            return res.status(401).json({
                ok : false,
                message : e.message
            })
        }
        console.log(e);
        return res.status(500).json({
            ok : false,
            message : "internal error"
        })
    }
})

router.get("/getorder/:orderId",async (req,res)=>{
    try{
        const {orderId} = req.params;
        let orderDetail = await Order.findById(orderId);
        if(orderDetail){
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

router.get("/getpaket/:paketId", async (req,res) => {
    const {paketId} = req.params;
    try{
        const paketDetail = await Paket.findById(paketId);
        if(paketDetail){
            return res.status(200).json({
                ok : true,
                data : paketDetail
            })
        }
        return res.json({
            ok : false,
            message : "paket tidak ditemukan",
            data : {}
        })
    }catch(e){
        return res.status(500).json({
            ok : false,
            message : "internal error"
        })
    }
})

router.get("/getalldata", async (req,res) => {
    const urlParam = url.parse(req.url,true);
    const query = urlParam.query;

    const parseItiftypeExist = (data,key) => {
        let list = []
        if(key){
            data.forEach((item)=>{
                if(item[key] !== undefined){
                    list.push(item[key])
                }
            })
            return list;
        }
        return data;
    }

    const hideCreds = (data) => {
        if(data){
            return data
                .map((val) => {
                    let hideEmail = val["email"].split("@")
                    return {
                        "_id": val._id,
                        "namaAcara" : val.namaAcara,
                        "paketId": val.paketId,
                        "tipeOrderan": val.tipeOrderan,
                        "atasNama": val.atasNama,
                        "email": `${hideEmail[0].slice(0,2)}${"*".repeat(hideEmail[0].length -2)}@${hideEmail[1]}`,
                        "whatsapp": `${val["whatsapp"].slice(0,2)}${"*".repeat(val["whatsapp"].length -4)}${val["whatsapp"].slice(-2)}`,
                        "jumlahPorsi": val.jumlahPorsi,
                        "tanggal": val.tanggal,
                        "status": val.status,
                    }
                });
        }
    }

    try{
        let tobeReturned = {};
        switch(query["q"]){
            case "paket":
                tobeReturned["paket"] = parseItiftypeExist(await Paket.find(),query["key"])
                break
            case "order":
                let order = await await Order.find();
                tobeReturned["active"] = hideCreds(order.filter((item) => item.active === true))
                tobeReturned["order"] = parseItiftypeExist(hideCreds(order.filter((item) => item.status == "order" || item.status == "paid")),query["key"]);
                break
            default:
                let paketDocs = await Paket.find();
                let orderdocs = await Order.find();
                tobeReturned = {
                    paket : parseItiftypeExist(paketDocs,query["key"]),
                    order : parseItiftypeExist(hideCreds(orderdocs.filter((item) => item.status == "order" || item.status == "paid")),query["key"]),
                    active : hideCreds(orderdocs.filter((item) => item.active === true))
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