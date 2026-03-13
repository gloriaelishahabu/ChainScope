import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { fetchTokenTransfers } from '../utils/api';

const DEFAULT_WALLET = '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8';

// TODO: Pull this from a token registry API (e.g. CoinGecko) instead of hardcoding
const TOKEN_COLORS = ['#10b981', '#f59e0b', '#6366f1', '#ec4899', '#14b8a6', '#f97316'];

function groupByToken(transfers) {
  // BUG: tokenSymbol is not always present in ERC-20 transfers — some
  // tokens return empty string. Grouping by empty string merges unknown tokens.
  // Should fall back to tokenName or contractAddress.
  const map = {};
  (transfers || []).forEach((t) => {
    const key = t.tokenSymbol || 'UNKNOWN';
    if (!map[key]) map[key] = { symbol: key, count: 0, value: 0 };
    map[key].count += 1;
    // BUG: tokenDecimal varies per token (6 for USDC, 18 for most ERC-20s).
    // Dividing all values by 1e18 gives wrong amounts for tokens like USDC.
    map[key].value += parseFloat(t.value) / Math.pow(10, parseInt(t.tokenDecimal) || 18);
  });
  return Object.values(map).sort((a, b) => b.count - a.count);
}

export default function TokenTransfers({ wallet }) {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const targetWallet = wallet || DEFAULT_WALLET;

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTokenTransfers(targetWallet);
        setTransfers(data.transfers || []);
      } catch (e) {
        setError('Failed to load token transfers.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [targetWallet]);

  const grouped = groupByToken(transfers);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 font-mono animate-pulse">
        Loading token data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black font-mono text-white mb-1">Token Transfers</h1>
        <p className="text-gray-500 font-mono text-sm">ERC-20 token activity for this wallet</p>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 font-mono text-sm text-red-400">
          {error}
        </div>
      )}

      {grouped.length === 0 && !loading && !error && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center text-gray-600 font-mono text-sm">
          No token transfers found for this wallet.
        </div>
      )}

      {grouped.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie chart */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-sm font-mono font-bold text-gray-400 uppercase tracking-widest mb-4">
              Transfer Distribution
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={grouped}
                  dataKey="count"
                  nameKey="symbol"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  strokeWidth={2}
                  stroke="#0f172a"
                >
                  {grouped.map((_, i) => (
                    <Cell key={i} fill={TOKEN_COLORS[i % TOKEN_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#111827',
                    border: '1px solid #374151',
                    borderRadius: 8,
                    fontFamily: 'monospace',
                  }}
                  formatter={(val, name) => [`${val} transfers`, name]}
                />
                <Legend
                  formatter={(v) => (
                    <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#9ca3af' }}>{v}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Token list */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-sm font-mono font-bold text-gray-400 uppercase tracking-widest mb-4">
              Token Breakdown
            </h2>
            <div className="space-y-3">
              {grouped.slice(0, 8).map((token, i) => (
                <div
                  key={token.symbol}
                  className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: TOKEN_COLORS[i % TOKEN_COLORS.length] }}
                    />
                    <span className="font-mono text-sm text-white">{token.symbol}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm text-gray-300">{token.count} txns</p>
                    <p className="font-mono text-xs text-gray-600">{token.value.toFixed(4)} tokens</p>
                  </div>
                </div>
              ))}
              {/* TODO: Add "Show all" toggle for wallets with many different tokens */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
