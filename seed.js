const db = require("./src/db");

db.exec(`
DELETE FROM transactions;
DELETE FROM wallets;
DELETE FROM users;
`);

const users = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)");
users.run("John", "john@example.com");
users.run("Paul", "paul@example.com");

const wallets = db.prepare("INSERT INTO wallets (user_id, balance) VALUES (?, ?)");
wallets.run(1, 1000);
wallets.run(2, 1000);

console.log("Database seeded successfully.");