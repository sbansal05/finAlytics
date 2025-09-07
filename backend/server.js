require('dotenv').config()
console.log(process.env.MONGO_URL);
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));



const { authRouter } = require("./routes/auth");
const { accountRouter } = require("./routes/account");
// const { transferRouter } = require("./routes/transfer");
// const { budgetRouter } = require("./routes/budget");
// const { goalsRouter } = require("./routes/goals");
// const { analyticsRouter } = require("./routes/analytics")



app.use("/api/v1/auth", authRouter);
app.use("/api/v1/account", accountRouter);
// app.use("api/v1/transaction", transferRouter);
// app.use("api/v1/budget", budgetRouter);
// app.use("express/v1/goals", goalsRouter);
// app.use("/api/v1/analytics", analyticsRouter);


async function main() {
    await mongoose.connect(process.env.MONGO_URL)
    app.listen(3000);
    console.log("listening on port 3000")
}

main()
