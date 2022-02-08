const express = require("express");
const Paket = require("../model/paket.model");
const bcrypt = require("bcrypt");
const router = express.Router();
const {Admin} = require("../model/admin.model");

const {
    authorizeUser,superAdminOnly
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
                gambar : body.detailCatering.gambar,
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


module.exports = router;