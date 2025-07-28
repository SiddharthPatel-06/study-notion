const express = require("express");
require("dotenv").config();
const app = express();

const connect = require("./config/database");
connect.connectDB();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({ success: true, message: "Welcome to the StudyNotion API!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
