require("dotenv").config();
const mongoose = require("mongoose");
const url = process.env.DBURI;
const DB_Name = process.env.DB_NAME;

const conndb = async () => {
  try {
    await mongoose.connect(`${url}/${DB_Name}`);
    console.log("connected.....");
  } catch (error) {
    console.error("Connection failed..");
  }
};

module.exports = conndb;
