require("dotenv").config();
const express = require("express");
const app = express();

const router = require("./app");
const conndb = require("./utils/DbConnection");
const cors = require("cors");

const PORT = 1000;

app.use(cors());

// app.use(express.json());

app.use("/", router);

conndb().then(() => {
  app.listen(PORT, () => {
    console.log("Listenning on Port:", PORT);
  });
});
