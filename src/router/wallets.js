const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/:id", (req, res) => {
    const walletId = Number(req.params.id);
    if (!walletId) return res.status(400).json({ error: "Invalid wallet ID" });
    console.log("wallet id: ", walletId);
    const wallet = db.prepare("SELECT * FROM wallets WHERE id = ?").get(walletId);
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });
    res.json(wallet);
});

module.exports = router;