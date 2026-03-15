const express = require("express");
const walletsRouter = require("./router/wallets");
require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/wallets", walletsRouter)
app.get("/", (req, res) => {
    res.json({message: "Welcome to wallet API"});
})

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
})