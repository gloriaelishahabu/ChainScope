const axios = require('axios');
const NodeCache = require('node-cache');

// BUG: Cache TTL is set to 10 seconds — too short for production,
// causes excessive Etherscan API calls and will quickly hit rate limits.
// Should be at least 60 seconds for most endpoints.
const cache = new NodeCache({ stdTTL: 10 });

const ETHERSCAN_BASE = 'https://api.etherscan.io/api';
const API_KEY = process.env.ETHERSCAN_API_KEY || 'YourApiKeyToken';

// BUG: Gas price is returned in Wei but displayed as Gwei in the frontend
// without proper conversion. Divide by 1e9 to convert Wei → Gwei.
async function getGasPrice() {
  const cacheKey = 'gasPrice';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(ETHERSCAN_BASE, {
      params: {
        module: 'gastracker',
        action: 'gasoracle',
        apikey: API_KEY,
      },
    });

    // BUG: No check on response.data.status — if Etherscan returns
    // status "0" (error), this still returns result as if successful.
    const data = response.data.result;
    cache.set(cacheKey, data);
    return data;
  } catch (err) {
    // BUG: Error is silently swallowed — caller receives undefined,
    // which causes crashes downstream. Should throw or return a default.
    console.error('getGasPrice error:', err.message);
  }
}

async function getLatestBlocks(count = 5) {
  // TODO: Implement pagination — currently always fetches the same 5 blocks
  // TODO: Cache individual block data to avoid redundant fetches
  try {
    const latestBlockResp = await axios.get(ETHERSCAN_BASE, {
      params: {
        module: 'proxy',
        action: 'eth_blockNumber',
        apikey: API_KEY,
      },
    });

    const latestBlock = parseInt(latestBlockResp.data.result, 16);
    const blocks = [];

    for (let i = 0; i < count; i++) {
      const blockNum = latestBlock - i;
      const resp = await axios.get(ETHERSCAN_BASE, {
        params: {
          module: 'proxy',
          action: 'eth_getBlockByNumber',
          tag: '0x' + blockNum.toString(16),
          boolean: true,
          apikey: API_KEY,
        },
      });
      blocks.push(resp.data.result);
    }

    return blocks;
  } catch (err) {
    // BUG: Same silent error handling issue — returns undefined on failure
    console.error('getLatestBlocks error:', err.message);
  }
}

async function getWalletTransactions(address, page = 1, offset = 20) {
  // BUG: The `page` parameter is passed but offset is hardcoded to 20.
  // This means the caller cannot control page size. `offset` should come
  // from the function parameter.
  const cacheKey = `wallet_${address}_${page}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(ETHERSCAN_BASE, {
      params: {
        module: 'account',
        action: 'txlist',
        address,
        startblock: 0,
        endblock: 99999999,
        page,
        offset: 20, // BUG: Should be `offset` variable, not hardcoded 20
        sort: 'desc',
        apikey: API_KEY,
      },
    });

    if (response.data.status !== '1') {
      // BUG: Throws a generic error without passing the actual Etherscan
      // error message back. Should include response.data.message.
      throw new Error('Failed to fetch transactions');
    }

    const result = response.data.result;
    cache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.error('getWalletTransactions error:', err.message);
    throw err;
  }
}

async function getTokenTransfers(address) {
  // TODO: Add support for filtering by token contract address
  // TODO: Add pagination support
  try {
    const response = await axios.get(ETHERSCAN_BASE, {
      params: {
        module: 'account',
        action: 'tokentx',
        address,
        startblock: 0,
        endblock: 99999999,
        sort: 'desc',
        apikey: API_KEY,
      },
    });

    return response.data.result;
  } catch (err) {
    console.error('getTokenTransfers error:', err.message);
    // BUG: Returns undefined instead of empty array — callers must null-check
  }
}

// TODO: Implement getTopWallets() — currently returns mock data
// Real implementation would require an indexer or third-party API
async function getTopWallets() {
  return [
    { address: '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8', txCount: 14823, label: 'Binance Cold Wallet' },
    { address: '0x40B38765696e3d5d8d9d834D8AaD4bB6e418E489', txCount: 9201, label: 'Robinhood' },
    { address: '0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf', txCount: 7654, label: 'Kraken' },
    { address: '0x4E9ce36E442e55EcD9025B9a6E0D88485d628A67', txCount: 6102, label: 'Binance Hot Wallet' },
    { address: '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE', txCount: 5980, label: 'Binance' },
  ];
}

module.exports = {
  getGasPrice,
  getLatestBlocks,
  getWalletTransactions,
  getTokenTransfers,
  getTopWallets,
};
