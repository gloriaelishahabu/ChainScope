# ⬡ ChainScope — Ethereum Blockchain Analytics Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Version](https://img.shields.io/badge/version-0.1.0--beta-orange.svg)]()
[![Status](https://img.shields.io/badge/status-active-success.svg)]()

ChainScope is an open-source Ethereum blockchain analytics dashboard. It lets developers, analysts, and researchers explore on-chain data: gas prices, block activity, wallet transaction histories, and ERC-20 token transfers — all in a clean, fast interface.

> ⚠️ **v0.1.0 is an early beta.** There are known bugs and missing features. See [`issues.txt`](issues.txt) for the full list. Contributions are very welcome.

---

## Screenshots

```
┌─────────────────────────────────────────────┐
│  ⬡ ChainScope  v0.1.0-beta                  │
│  Dashboard | Wallet | Transactions | Tokens  │
├────────────┬────────────┬────────────────────┤
│ Safe Gas   │ Fast Gas   │ Latest Block       │
│ 24 Gwei    │ 47 Gwei    │ #18,824,011        │
├────────────┴────────────┴────────────────────┤
│  Gas Price Trend (24h)      [Line Chart]     │
├──────────────────┬──────────────────────────┤
│  Recent Blocks   │  Top Active Wallets      │
│  #18824011 ···   │  [Horizontal Bar Chart]  │
└──────────────────┴──────────────────────────┘
```

---

## Features

- **Dashboard** — Live gas prices (safe/average/fast), recent block activity, top wallet leaderboard, 24h gas trend chart
- **Wallet Lookup** — Search any Ethereum address for its transaction history and ETH value summary
- **Transaction Table** — Paginated (WIP) transaction history with hash, from/to, value, gas, status, and date
- **Token Transfers** — ERC-20 transfer breakdown with pie chart visualization
- **REST API** — Express backend with endpoints for analytics, block data, and wallet lookups

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Tailwind CSS, Recharts    |
| Backend   | Node.js, Express                    |
| Data      | Etherscan API (public)              |
| Fonts     | JetBrains Mono                      |

---

## Project Structure

```
chainscope/
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx         # Main overview page
│   │   │   ├── WalletSearch.jsx      # Address search UI
│   │   │   ├── TransactionTable.jsx  # Tx history table
│   │   │   └── TokenTransfers.jsx    # ERC-20 visualizations
│   │   ├── utils/
│   │   │   └── api.js                # Axios API client
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── App.jsx                   # Router and layout
│   │   └── index.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/
│   ├── routes/
│   │   ├── analytics.js              # /api/analytics/* routes
│   │   └── wallet.js                 # /api/wallet/* routes
│   ├── services/
│   │   └── blockchainService.js      # Etherscan API wrapper + cache
│   ├── server.js                     # Express app entrypoint
│   ├── .env.example
│   └── package.json
│
├── docs/
│   └── api.md                        # API endpoint documentation
│
├── issues.txt                        # Open contributor issues
├── CONTRIBUTING.md
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- A free [Etherscan API key](https://etherscan.io/apis)

### 1. Clone the repository

```bash
git clone https://github.com/chainscope/chainscope.git
cd chainscope
```

### 2. Set up the backend

```bash
cd backend
cp .env.example .env
# Edit .env and add your ETHERSCAN_API_KEY
npm install
npm run dev
```

The API will start on `http://localhost:3001`.

### 3. Set up the frontend

```bash
cd ../frontend
npm install
npm start
```

The dashboard will open at `http://localhost:3000`.

> **Note:** If `REACT_APP_API_URL` is not set, the frontend defaults to `http://localhost:3001/api`. For production deployments, set this environment variable.

---

## API Reference

See [`docs/api.md`](docs/api.md) for full endpoint documentation.

Quick reference:

| Method | Endpoint                          | Description                    |
|--------|-----------------------------------|--------------------------------|
| GET    | `/api/analytics/overview`         | Dashboard summary data         |
| GET    | `/api/analytics/gas-history`      | 24h gas price history          |
| GET    | `/api/analytics/blocks?count=N`   | Recent N blocks                |
| GET    | `/api/wallet/:address`            | Wallet tx history              |
| GET    | `/api/wallet/:address/tokens`     | ERC-20 token transfers         |
| GET    | `/health`                         | API health check               |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable            | Required | Description                         |
|---------------------|----------|-------------------------------------|
| `ETHERSCAN_API_KEY` | Yes      | Your Etherscan API key              |
| `PORT`              | No       | API port (default: 3001)            |
| `NODE_ENV`          | No       | `development` or `production`       |

### Frontend (`frontend/.env`)

| Variable              | Required | Description                              |
|-----------------------|----------|------------------------------------------|
| `REACT_APP_API_URL`   | No       | Backend API base URL (default: localhost)|

---

## Development Guide

### Running tests

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

### Linting

```bash
# Coming soon — see issue #14
```

### Making API calls

All Etherscan API calls go through `backend/services/blockchainService.js`. This is the right place to add caching, error handling improvements, or new data fetchers.

---

## Known Issues

See [`issues.txt`](issues.txt) for a full list of open bugs and feature requests, including complexity ratings and file locations.

---

## Contributing

Contributions are welcome and encouraged. Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening a PR.

Good first issues are tagged **[Trivial]** in `issues.txt`.

---

## License

MIT © ChainScope Contributors
