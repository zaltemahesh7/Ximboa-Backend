// var http = require("http");
// var app = require("./app");
// var server = http.createServer(app);
// server.listen(1000, console.log("app is running "));

require('dotenv').config();
const express = require('express');
const app = express();
const router = require('./app');
const conndb = require('./utils/DbConne');
const cors = require('cors');

const PORT = 1000;

app.use(cors());

// app.use(express.json());
app.use('/', router);
// app.use('/admin', adminRoute)

conndb().then(() => {
    app.listen(PORT, () => {
        console.log("Listenning on Port:", PORT);
    })
});