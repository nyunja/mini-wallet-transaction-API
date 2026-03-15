const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/:id", (req, res) => {
  const walletId = Number(req.params.id);
  if (!walletId) return res.status(400).json({ error: "Invalid wallet ID" });
  const wallet = db
    .prepare("SELECT * FROM wallets WHERE id = ?")
    .get(walletId);
  if (!wallet) return res.status(404).json({ error: "Wallet not found" });
  res.json(wallet);
});

router.post("/:id/deposit", (req, res) => {
  const walletId = Number(req.params.id);
  const { amount } = req.body;
  if (!walletId) return res.status(400).json({ error: "Invalid wallet ID" });
  if (!amount || typeof amount !== "number" || amount <= 0) {
    return res
      .status(400)
      .json({ error: "Amount should be a valid number greater than 0" });
  }
  const wallet = db.prepare("SELECT * FROM wallets WHERE id =?").get(walletId);
  if (!walletId) return res.status(400).json({ error: "Invalid wallet ID" });
  const tx = db.transaction(() => {
    db.prepare("UPDATE wallets SET balance = balance + ? WHERE id = ?").run(
      amount,
      walletId,
    );
    db.prepare(
      "INSERT INTO transactions (type, to_wallet_id, from_wallet_id, amount) VALUES (?, ?, ?, ?)",
    ).run(walletId, null, amount, "deposit");
  });
  tx();
  const updatedWallet = db
    .prepare("SELECT * FROM wallets WHERE id = ?")
    .get(walletId);

  res.json({ message: "Deposit successful", wallet: updatedWallet });
});

module.exports = router;
