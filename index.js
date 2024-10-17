require("dotenv").config();
const express = require("express");
const app = express();

const router = require("./app");
const conndb = require("./config/DbConnection");
const cors = require("cors");

const PORT = 1000;

app.use(cors());

// const {
//   S3Client,
//   GetObjectCommand,
// } = require("@aws-sdk/client-s3");
// const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// const s3client = new S3Client({
//   region: "us-east-1",
//   credentials: {
//     accessKeyId: "AKIA2S2Y4BC2QILAKF5E",
//     secretAccessKey: "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",
//   },
// });

// async function getObjectURL(key) {
//   const command = new GetObjectCommand({
//     Bucket: "ximboatest",  // Correct Bucket name
//     Key: key,              // Use capital 'Key' here
//   });

//   // Pass the instantiated client (s3client) instead of S3Client class
//   const url = await getSignedUrl(s3client, command);
//   return url;
// }

// getObjectURL("1.jpg")
//   .then(url => console.log(`url for 1.jpg: `, url))
//   .catch(err => console.error("Error: ", err));

// app.use(express.json());

app.use("/", router);

conndb().then(() => {
  app.listen(PORT, () => {
    console.log("Listenning on Port:", PORT);
  });
});
