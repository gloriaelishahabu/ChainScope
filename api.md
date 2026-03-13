# ChainScope API Documentation

Base URL: `http://localhost:3001/api`

> **Note:** This documentation is incomplete. Several endpoints are missing descriptions and example responses. See [issues.txt issue #15](../issues.txt).

---

## Health Check

### `GET /health`

Returns server status.

**Response:**
```json
{
  "status": "ok",
  "version": "0.1.0"
}
```

---

## Analytics

### `GET /api/analytics/overview`

Returns a combined summary of network gas prices, recent blocks, and top wallets.

**Response:**
```json
{
  "gas": {
    "SafeGasPrice": "24",
    "ProposeGasPrice": "35",
    "FastGasPrice": "47"
  },
  "recentBlocks": [ ... ],
  "topWallets": [
    {
      "address": "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8",
      "txCount": 14823,
      "label": "Binance Cold Wallet"
    }
  ]
}
```

**Known issues:** If Etherscan is rate-limited, returns 500 with no useful message.

---

### `GET /api/analytics/gas-history`

Returns mock 24-hour gas price history. Real implementation pending.

**Response:**
```json
[
  { "hour": 0, "safeLow": 18, "average": 27, "fast": 52 },
  ...
]
```

> ⚠️ Currently returns **randomly generated mock data** on every request. See issues.txt #9.

---

### `GET /api/analytics/blocks`

Returns recent Ethereum blocks.

**Query Parameters:**

| Param   | Type    | Default | Description                      |
|---------|---------|---------|----------------------------------|
| `count` | integer | 10      | Number of blocks to return (⚠️ not validated — see issues.txt #10) |

**Response:** Array of Ethereum block objects from `eth_getBlockByNumber`.

---

## Wallet

### `GET /api/wallet/:address`

Returns transaction history for an Ethereum address.

**Parameters:**

| Param     | Type   | Description              |
|-----------|--------|--------------------------|
| `address` | string | Ethereum wallet address  |

**Query Parameters:**

| Param  | Type    | Default | Description      |
|--------|---------|---------|------------------|
| `page` | integer | 1       | Page number (⚠️ pagination partially broken — see issues.txt #4) |

**Response:**
```json
{
  "address": "0x...",
  "page": 1,
  "transactions": [
    {
      "hash": "0x...",
      "from": "0x...",
      "to": "0x...",
      "value": "1000000000000000000",
      "gasUsed": "21000",
      "isError": "0",
      "timeStamp": "1698765432"
    }
  ]
}
```

**Notes:**
- `value` is in Wei. Divide by `1e18` to get ETH.
- `isError` is a string `"0"` (success) or `"1"` (failed), not a boolean.
- `timeStamp` is a Unix epoch string (seconds). Multiply by 1000 before passing to `new Date()`.

---

### `GET /api/wallet/:address/tokens`

Returns ERC-20 token transfer history for a wallet.

> ⚠️ Pagination not yet implemented. Returns up to 10,000 results unsorted.

**Response:**
```json
{
  "address": "0x...",
  "transfers": [
    {
      "tokenName": "USD Coin",
      "tokenSymbol": "USDC",
      "tokenDecimal": "6",
      "value": "5000000",
      "from": "0x...",
      "to": "0x...",
      "timeStamp": "1698765432"
    }
  ]
}
```

---

## Error Responses

All errors currently return:

```json
{
  "error": "Error message string"
}
```

> ⚠️ Error status codes are always 500 regardless of error type. Proper status codes (400, 404, 502) should be added. See issues.txt #13.
