const express = require("express");
const walletsRouter = require("./router/wallets");
const rateLimit = require('express-rate-limit');
const helmet = require("helmet");
const cors = require("cors");
require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests — please try again later' }
});
app.use(limiter);

app.use(cors());
app.use(helmet());

// Content-Type enforcement
app.use((req, res, next) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const contentType = req.headers["content-type"] || "";
    if (!contentType.includes("application/json")) {
      return res.status(415).json({ error: "Content-Type must be application/json" });
    }
  }
  next();
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use("/wallets", walletsRouter);
app.get("/", (req, res) => { 
    res.json({ message: "Welcome to the Mini Wallet Transaction API" });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.path} not found. Make sure you are using the correct address.` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
})