# Mini Wallet Transaction API

A simple backend service for managing wallet transactions built with Node.js, Express, and SQLite.

---

## Setup

```bash
npm install
```

Seed the database with two test users and wallets:

```bash
npm run seed
```

## Run

```bash
npm start
```

Server runs at `http://localhost:3000`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/wallets/:id` | Get wallet details |
| POST | `/wallets/:id/deposit` | Deposit into a wallet |
| POST | `/wallets/:id/transfer` | Transfer between wallets |
| GET | `/wallets/:id/transactions` | Get wallet transaction history |

---

## Example Requests

**Get wallet**
```bash
curl http://localhost:3000/wallets/1
```

**Deposit**
```bash
curl -X POST http://localhost:3000/wallets/1/deposit \
  -H "Content-Type: application/json" \
  -d '{"amount": 500}'
```

**Transfer**
```bash
curl -X POST http://localhost:3000/wallets/1/transfer \
  -H "Content-Type: application/json" \
  -d '{"toWalletId": 2, "amount": 200}'
```

**Transaction history**
```bash
curl http://localhost:3000/wallets/1/transactions
```

---

## Seed State

After running `npm run seed`:

| User | Wallet ID | Balance |
|------|-----------|---------|
| John | 1 | 1000 (= $10.00) |
| Paul | 2 | 1000 (= $10.00) |

---

## Design Decisions

### 1. `better-sqlite3` over standard `sqlite3`
Provides a synchronous API and cleaner code, built-in transaction helpers for atomicity, and better suited for a small service.

### 2. Storing balances in cents (integers)
Floating-point arithmetic causes rounding errors in financial calculations.

### 3. Database transactions for money movement (Atomicity)
All wallet operations (debit sender, credit receiver, insert record) are wrapped in a single DB transaction. If any step fails, the entire operation rolls back — preventing partial updates and data corruption.

### 4. SQLite PRAGMA settings
- `foreign_keys = ON` — enforces relational integrity between tables
- `journal_mode = WAL` — improves performance and concurrency

### 5. Separated schema and seed files
`db.js` handles schema initialization. `seed.js` handles test data. Single responsibility — reseed without touching schema logic.

### 6. CSRF mitigation via Content-Type enforcement
All mutating routes (`POST`, `PUT`, `PATCH`, `DELETE`) require `Content-Type: application/json`. Browsers cannot set this header cross-origin without a CORS preflight, blocking cross-site form-based CSRF attacks.

### 7. Helmet middleware
Sets secure HTTP response headers out of the box (e.g. `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`).
