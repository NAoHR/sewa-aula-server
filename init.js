const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const {Admin} = require("./model/admin.model");
const Paket = require("./model/paket.model");



const paketDetail = [
    {
        // contoh format untuk paket plain
        "paketPlain" : true,
        "namaPaket" : "paket 1",
        "hargaAula" : 300000,
        "deskripsi" : "paket yang menyediakan aula saja dengan fasilitasnya",
    },
    {
        // contoh format untuk yang bukan paket plain
        "paketPlain" : false,
        "namaPaket" : "paket 2",
        "hargaAula" : 300000,
        "deskripsi" : "paket yang menyediakan aula saja dengan fasilitasnya serta paket ayam",
        "detailCatering" : {
          "hargaPerBuah" : 30000,
          "gambar" : "paket_2.jpeg",
          "detailPaketCatering" : [
            "nasi ayam (bakar / goreng)",
            "mihun",
            "pisang",
            "minuman (air putih)"
          ]
        }
    },
    {
        "paketPlain" : false,
        "namaPaket" : "paket 3",
        "hargaAula" : 300000,
        "deskripsi" : "paket yang menyediakan aula saja dengan fasilitasnya serta paket daging kambing",
        "detailCatering" : {
          "hargaPerBuah" : 50000,
          "gambar" : "paket_1.jpeg",
          "detailPaketCatering" : [
            "nasi sate daging kamhbing",
            "kambing gulay",
            "telur rebus",
            "minuman (air putih)"
          ]
        }
    }
]

const adminDetail = [
    {
        "username" : "superAdmin",
        "password" : process.env.pwadmin1,
        "role" : "super_admin"
    },
    {
        "username" : "adminbiasa",
        "password" : process.env.pwadmin2,
        "role" : "admin"
    }
]


const addAdmin = async ({username, password, role}) => {
  try{
    console.log(`  [!] mulai untuk membuat ${username}`)
    let newpassword = await bcrypt.hash(password, 10);

    let makeTodb = new Admin({
      username : username,
      password : newpassword,
      role : role
    })
    await makeTodb.save();

    console.log(`    -> ${username} berhasil ditambahkan`)
    return true

  }catch(e){
    console.log(`    -> gagal menambahkan ${username}`)
    console.log(e);
    return false
  }
}

const addPaket = async (paket) => {
  try{
    console.log(`  [!] mulai untuk membuat ${paket.namaPaket}`);
    const paketDoc = new Paket(
      paket
    );
    await paketDoc.save();
    console.log(`    -> berhasil menambahkan ${paket.namaPaket}`);
    return true
  }catch(e){
    console.log(`    -> gagal menambahkan ${paket.namaPaket}`);
    console.log(e)
    return false;
  }
}

mongoose.connect(process.env.IMONGO)
  .then( async (val)=>{
    console.log("mongodb connected")
    console.log("[?] menambahkan admin")
    for (item of adminDetail){
      await addAdmin(item);
      console.log()
    }
    console.log("[?] menambahkan paket");
    for (item of paketDetail){
      await addPaket(item);
      console.log()
    }
    console.log("selesai")
  })