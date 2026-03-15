const express = require("express");
const walletsRouter = require("./router/wallets");
const helmet = require("helmet");
require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(helmet());

app.use((req, res, next) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const contentType = req.headers["content-type"] || "";
    if (!contentType.includes("application/json")) {
      return res.status(415).json({ error: "Content-Type must be application/json" });
    }
  }
  next();
});

app.use("/wallets", walletsRouter);
app.get("/", (req, res) => { 
    res.json({ message: "Welcome to wallet API" });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
})