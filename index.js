const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRouter = require("./router/AuthRouter");
const adminRouter = require("./router/AdminRouter");
const clientRouter = require("./router/ClientRouter");

const app = express();
app.use(cors({
    origin : "*",
    credentials : true
}))

app.use(express.json());
app.use(bodyParser.urlencoded({extended : true}));

app.use("/auth",authRouter);
app.use("/admin", adminRouter);
app.use("/client",clientRouter);

mongoose.connect(process.env.NEWMONGO
    )
    .then(()=>{
        console.log("mongodb connected")
        app.listen(process.env.PORT, () =>{
            console.log("express server started");
        })
    })
    .catch((err)=>{
        console.log(err);
    })