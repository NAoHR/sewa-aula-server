const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const authRouter = require("./router/AuthRouter");

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({extended : true}));

app.use("/auth",authRouter);

mongoose.connect(process.env.LOCAL_DEV_MONGO
    )
    .then(()=>{
        console.log("mongodb connected")
        app.listen(5000, () =>{
            console.log("express server started");
        })
    })
    .catch((err)=>{
        console.log(err);
    })