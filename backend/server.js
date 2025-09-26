require('dotenv').config()
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(express.json());

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));



const { authRouter } = require("./routes/auth");
const { accountRouter } = require("./routes/account");
const { transactionRouter } = require("./routes/transaction");
const { budgetRouter } = require("./routes/budget");
const { goalsRouter } = require("./routes/goals");



app.use("/api/v1/auth", authRouter);
app.use("/api/v1/account", accountRouter);
app.use("/api/v1/transaction", transactionRouter);
app.use("/api/v1/budget", budgetRouter);
app.use("/api/v1/goals", goalsRouter);


async function main() {
    await mongoose.connect(process.env.MONGO_URI)
  
}

main()
module.exports = app;
