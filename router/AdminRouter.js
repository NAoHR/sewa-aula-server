const express = require("express");
const Paket = require("../model/paket.model");
const Order = require("../model/order.model")
const bcrypt = require("bcrypt");
const router = express.Router();
const url = require('url');

const {Admin} = require("../model/admin.model");
const {
    authorizeUser,superAdminOnly, isUserLoggedIn
} = require("../utils/authMiddleware/authMiddleware");

router.post("/tambahpaket", authorizeUser, async (req,res) => {
    try{
        const body = req.body;
        const tambahPaket = new Paket({
            paketPlain : body.paketPlain,
            namaPaket : body.namaPaket,
            hargaAula : Number(body.hargaAula),
            deskripsi : body.deskripsi,
            detailCatering : body.paketPlain === true ? undefined : {
                gambar : body.detailCatering.gambar ? body.detailCatering.gambar : undefined,
                hargaPerBuah : Number(body.detailCatering.hargaPerBuah) === NaN ? undefined : Number(body.detailCatering.hargaPerBuah),
                detailPaketCatering : body.detailCatering.detailPaketCatering ? body.detailCatering.detailPaketCatering : undefined
            }
        });
        await tambahPaket.save();
        return res.json({
            ok : true,
            message : "data berhasil ditambahkan",
			data : tambahPaket
        });
    }catch(e){
        console.log(e)
        switch(e.name){
            case "TypeError":
                return res.status(401).json({
                    ok : false,
                    message : e.message
                })
            case "ValidationError":
                const errMessage = e.message.split(": ")
                return res.status(401).json({
                    ok : false,
                    message : errMessage[errMessage.length -1]
                });
            case "Error":
                return res.json({
                    ok : false,
                    message : e.message
                })
            default:
                res.status(500).json({
                    ok : false,
                    message : "internal error"
                })
        }
    }
})


router.post("/addAdmin", authorizeUser , superAdminOnly ,async (req,res) =>{
    const { username, password,role } = req.body;
    if(username !== undefined && password !== undefined && role !== undefined){
        try{
            const newPassword = await bcrypt.hash(password,10);
            const createAdmin = new Admin({
                username : username,
                password : newPassword,
                role : role,
            })
            await createAdmin.save();

            const accessToken = await createAdmin.createAccessToken();
            const refreshToken = await createAdmin.createRefreshToken()

            if(!accessToken || !refreshToken){
                return res.status(500).status({
                    ok : false,
                    message : "internal error"
                })
            }
            return res.status(200).json({
                ok : true,
                accessToken : accessToken,
                refreshToken : refreshToken
            })
        }catch(e){
            console.log(e);
            if(e.message.split(":")[0] === "E11000 duplicate key error collection"){
                return res.status(500).json({
                    ok : false,
                    message : "username sudah terdaftar"
                })
            }
            return res.status(500).json({
                ok : false,
                message : "server error"
            })
        }
    }
    res.json({
        ok : false,
        message : "tidak valid"
    })
})

router.post("/edit/admin/:adminId",authorizeUser, async (req,res) => {
    try{
        const {adminId} = req.params;

        const updateIt = async (details) => {
            let updateAdmin = await Admin.updateOne({_id : adminId},
                details,{
                    runValidators : true
                });
            console.log(updateAdmin)
            return res.send("ok")
        }

        if(adminId){
            if(adminId == req.detailUser._id){
                return await updateIt(req.body);

            }else if(req.detailUser.role == "super_admin" && adminId != req.detailUser._id){
                return await updateIt(req.body);
            }
            console.log(req.detailUser);
            return res.status(401).json({
                ok : false,
                message : "not authorized"
            })
        }
        return res.status(404).json({
            ok : false,
            message : "id tidak ada"
        })
    }catch(e){
        console.log(e);
        return res.status(501).json({
            ok : "false",
            message : "internal error"
        })
    }
})




// ALL ABOUT PAKET AND ORDER STUFF




router.get("/getalldata/order-paid", authorizeUser, async (req,res) => {
    try{
        const paket = await Paket.find();
        const order = await Order.find();
        return res.status(200).json({
            ok : true,
            data : {
                paket : paket,
                order : order.filter(item => item.status == "paid" || item.status == "order")
            }
        })
    }catch(e){
        return res.status(500).json({
            ok : false,
            message : "internal error"
        })
    }
})

router.get("/getalldata",authorizeUser, async (req,res) => {
    const urlParam = url.parse(req.url,true);
    const query = urlParam.query;
    try{
        let tobeReturned = {};
        switch(query["q"]){
            case "paket":
                let paket = await Paket.find()
                tobeReturned["paket"] = paket;
                break
            case "order":
                let order = await Order.find();
                tobeReturned["order"] = order;
                tobeReturned["active"] = order.filter((item) => item.active === true)
                break
            default:
                let paketDocs = await Paket.find();
                let orderdocs = await Order.find();
                tobeReturned = {
                    paket : paketDocs,
                    order : orderdocs,
                    active : orderdocs.filter((item) => item.active === true)
                }
                break
        }
        return res.json({
            ok : true,
            data : tobeReturned
        })
    }catch(e){
        return res.json({
            ok : false,
            message : "internal error"
        })
    }
})

router.post("/edit/paket/:paketId", authorizeUser,async (req,res)=>{
    const {paketId} = req.params;
    if(paketId){
        try{
            let update = await Paket.updateOne({_id : String(paketId)},req.body,{
                runValidators : true
            })
            return res.status(200).json({
                ok : true,
                message : "berhasil dirubah",
                data : update
            })
        }catch(e){
            if(e.name === "ValidationError" || e.name === "Error"){
                return res.json({
                    ok : false,
                    message : e.message
                })
            }
            return res.status(500).json({
                ok : false,
                message : "internal error"
            })
        }
    }
    return res.json({
        ok : false,
        message : "masukkan id ke /edit/paket/id"
    })
})

router.post("/edit/order/:orderId", authorizeUser,async (req,res)=>{
    const {orderId} = req.params;
    if(orderId){
        try{
            let update = await Order.updateOne({_id : String(orderId)},req.body,{
                runValidators : true
            })
            return res.status(200).json({
                ok : true,
                message : "berhasil dirubah",
                data : update
            })
        }catch(e){
            console.log(e);
            if(e.name === "ValidationError" || e.name === "Error"){
                return res.json({
                    ok : false,
                    message : e.message
                })
            }
            return res.status(500).json({
                ok : false,
                message : "internal error"
            })
        }
    }
    return res.json({
        ok : false,
        message : "masukkan id ke /edit/paket/id"
    })
})

router.delete("/delete/order/:orderId", authorizeUser,async (req,res) => {
    const {orderId} = req.params;
    try{
        const deleteOrder = await Order.deleteOne({_id : orderId});
        if(deleteOrder.deletedCount === 1){
            return res.status(200).json({
                ok : true,
                message : `${orderId} ter-delete`
            })
        }
        return res.status(500).json({
            ok : false,
            message : "tidak ada di dalam database"
        })
    }catch(e){
        console.log(e);
        return res.status(406).json({
            ok : false,
            message : "internal error"
        })
    }
})

router.delete("/delete/paket/:paketId", authorizeUser ,async (req,res) => {
    const {paketId} = req.params;
    try{
        const toBeDeletedPacket = await Paket.find({_id : paketId});

        if(toBeDeletedPacket){

            const relatedOrderDoc = await Order.find({paketId : paketId});
            const urlParams = url.parse(req.url,true)
            const params = urlParams.query;
            
            if(Number(params["force"]) === 1){
                let tdPaket = await Paket.deleteOne({_id : paketId});
                let tdOrder = await Order.deleteMany({ paketId : paketId});
                return res.status(200).json({
                    ok : true,
                    message : "paket dan order berhasil terhapus",
                    detail : {
                        paket : {
                            status : tdPaket,
                            data : toBeDeletedPacket
                        },
                        order : {
                            status : tdOrder,
                            data : relatedOrderDoc
                        }
                    }
                })
            }else{
                if(relatedOrderDoc.length > 0){
                    return res.status(400).json({
                        ok : false,
                        message : `terdapat ${relatedOrderDoc.length} item yang akan bergantung pada id ini`
                    })
                }else{
                    let deletePaket = await Paket.deleteOne({_id : paketId});

                    return res.json({
                        ok : true,
                        message : "paket berhasil terhapus"
                    })
                }
            }
        }
        return res.json({
            ok : false,
            message : "paket tidak ditemukan"
        })


    }catch(e){
        console.log(e);
        return res.status(501).json({
            ok : false,
            message : "internal error"
        })
    }
})
module.exports = router;
