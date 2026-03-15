const express = require("express");
const router = express.Router();
const db = require("../db");

/**
 * GET /wallets/:id
 * Fetch wallet details
 */
router.get("/:id", (req, res) => {
  const walletId = Number(req.params.id);

  if (!walletId) return res.status(400).json({ error: "Invalid wallet ID" });

  const wallet = db.prepare("SELECT * FROM wallets WHERE id = ?").get(walletId);

  if (!wallet) return res.status(404).json({ error: "Wallet not found" });

  res.json(wallet);
});

/**
 * POST /wallets/:id/deposit
 */
router.post("/:id/deposit", (req, res) => {
  const walletId = Number(req.params.id);
  const { amount } = req.body;

  if (!walletId) return res.status(400).json({ error: "Invalid wallet ID" });

  if (!amount || typeof amount !== "number" || amount <= 0) {
    return res
      .status(400)
      .json({ error: "Amount should be a valid number greater than 0" });
  }

  const wallet = db.prepare("SELECT * FROM wallets WHERE id = ?").get(walletId);

  if (!wallet) return res.status(404).json({ error: "Wallet not found" });

  const tx = db.transaction(() => {
    db
      .prepare("UPDATE wallets SET balance = balance + ? WHERE id = ?")
      .run( amount, walletId,);
    db
      .prepare("INSERT INTO transactions (type, to_wallet_id, from_wallet_id, amount) VALUES (?, ?, ?, ?)",)
      .run("deposit", walletId, null, amount);
  });

  tx();

  const updatedWallet = db
    .prepare("SELECT * FROM wallets WHERE id = ?")
    .get(walletId);

  res.json({ message: "Deposit successful", wallet: updatedWallet });
});

/**
 * POST /wallets/:id/transfer
 */
router.post("/:id/transfer", (req, res) => {
  const fromWalletId = Number(req.params.id);
  const { amount } = req.body;
  const toWalletId = Number(req.body.toWalletId);

  if (!fromWalletId) {
    return res.status(400).json({ error: "Invalid sender wallet id" });
  }

  if (!toWalletId) {
    return res.status(400).json({ error: "Invalid receiver wallet id" });
  }

  if (fromWalletId === toWalletId) {
    return res.status(400).json({ error: "Cannot transfer to the same wallet" });
  }

  if (!amount || typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ error: "Amount must be greater than zero" });
  }

  const wallet = db.prepare("SELECT * FROM wallets WHERE id = ?").get(fromWalletId);
  if (!wallet) return res.status(404).json({ error: "Sender wallet not found" });

  const toWallet = db.prepare("SELECT * FROM wallets WHERE id = ?").get(toWalletId);
  if (!toWallet) return res.status(404).json({ error: "Receiver wallet not found" });

  if (wallet.balance < amount) {
    return res.status(400).json({ error: "Insufficient balance" });
  }

  const tx = db.transaction(() => {
    db.prepare(`UPDATE wallets SET balance = balance + ? WHERE id = ?`,).run(amount, toWalletId);

    db.prepare(`UPDATE wallets SET balance = balance - ? WHERE id = ?`,).run(amount, fromWalletId);

   db.prepare(`INSERT INTO transactions (type, to_wallet_id, from_wallet_id, amount) VALUES (?, ?, ?, ?)`,).run("transfer", toWalletId, fromWalletId, amount);
  });

  tx();

  const updatedWallet = db.prepare("SELECT * FROM wallets WHERE id = ?").get(fromWalletId);

  res.json({ message: "Transfer successful", wallet: updatedWallet,});
});

/**
 * GET /wallets/:id/transactions
 */
router.get("/:id/transactions", (req, res) => {

  const walletId = Number(req.params.id);

  if (!walletId) {
    return res.status(400).json({ error: "Invalid wallet id" });
  }

  const transactions = db.prepare(`SELECT * FROM transactions WHERE from_wallet_id = ? OR to_wallet_id = ? ORDER BY created_at DESC`).all(walletId, walletId);

  res.json(transactions);

});

module.exports = router;
