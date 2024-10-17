require("dotenv").config();
const mongoose = require("mongoose");
const url = process.env.DBURI;
const DB_Name = process.env.DB_NAME;

const conndb = async () => {
  try {
    const con = await mongoose.connect(`${url}/${DB_Name}`);
    console.log("connected to host :", con.connection.host);
  } catch (error) {
    console.error("Connection failed..");
  }
};

module.exports = conndb;
