import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { fetchOverview, fetchGasHistory } from '../utils/api';

// BUG: StatCard re-renders every time Dashboard re-renders because it's
// defined inside the module but not memoized. If Dashboard has many children,
// this causes noticeable jank. Should use React.memo().
function StatCard({ label, value, sub, accent }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
      <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-3xl font-black font-mono ${accent || 'text-white'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1 font-mono">{sub}</p>}
    </div>
  );
}

function BlockRow({ block }) {
  if (!block) return null;
  const txCount = block.transactions?.length || 0;
  const blockNum = parseInt(block.number, 16);
  // BUG: timestamp is in Unix seconds but is displayed raw without formatting.
  // Should use: new Date(parseInt(block.timestamp, 16) * 1000).toLocaleTimeString()
  const timestamp = block.timestamp;

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0 font-mono text-sm">
      <span className="text-emerald-400">#{blockNum.toLocaleString()}</span>
      <span className="text-gray-400">{txCount} txns</span>
      <span className="text-gray-600 text-xs">{timestamp}</span>
    </div>
  );
}

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [gasHistory, setGasHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // TODO: Add auto-refresh every 30 seconds using setInterval
    // TODO: Show a "last updated" timestamp
    async function load() {
      try {
        const [ov, gh] = await Promise.all([fetchOverview(), fetchGasHistory()]);
        setOverview(ov);
        setGasHistory(gh);
      } catch (e) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    // TODO: Replace with proper skeleton loaders instead of a plain text string
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 font-mono animate-pulse">
        Loading chain data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 text-red-400 font-mono">
        {error}
      </div>
    );
  }

  const gas = overview?.gas;
  // BUG: Gas values from Etherscan gasoracle are already in Gwei,
  // but blockchainService returns raw Wei for the eth_gasPrice endpoint
  // causing inconsistency. All gas displays should normalize to Gwei.
  const safeGasGwei = gas?.SafeGasPrice || '—';
  const fastGasGwei = gas?.FastGasPrice || '—';

  const topWallets = overview?.topWallets || [];
  const recentBlocks = overview?.recentBlocks || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black font-mono text-white mb-1">Network Overview</h1>
        <p className="text-gray-500 font-mono text-sm">Live Ethereum mainnet analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Safe Gas" value={`${safeGasGwei} Gwei`} accent="text-emerald-400" />
        <StatCard label="Fast Gas" value={`${fastGasGwei} Gwei`} accent="text-amber-400" />
        <StatCard
          label="Latest Block"
          value={recentBlocks[0] ? `#${parseInt(recentBlocks[0].number, 16).toLocaleString()}` : '—'}
        />
        <StatCard
          label="Txns in Block"
          value={recentBlocks[0]?.transactions?.length ?? '—'}
          sub="latest block"
        />
      </div>

      {/* Gas History Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-sm font-mono font-bold text-gray-400 uppercase tracking-widest mb-4">
          Gas Price Trend (24h)
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={gasHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis
              dataKey="hour"
              tickFormatter={(h) => `${h}h`}
              stroke="#374151"
              tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'monospace' }}
            />
            <YAxis
              stroke="#374151"
              tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'monospace' }}
            />
            <Tooltip
              contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontFamily: 'monospace' }}
              labelFormatter={(h) => `Hour ${h}`}
            />
            <Line type="monotone" dataKey="safeLow" stroke="#10b981" dot={false} strokeWidth={2} name="Safe" />
            <Line type="monotone" dataKey="average" stroke="#f59e0b" dot={false} strokeWidth={2} name="Average" />
            <Line type="monotone" dataKey="fast" stroke="#ef4444" dot={false} strokeWidth={2} name="Fast" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Blocks */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-sm font-mono font-bold text-gray-400 uppercase tracking-widest mb-4">
            Recent Blocks
          </h2>
          {recentBlocks.length === 0 ? (
            <p className="text-gray-600 font-mono text-sm">No block data available</p>
          ) : (
            recentBlocks.map((b, i) => <BlockRow key={i} block={b} />)
          )}
        </div>

        {/* Top Wallets */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-sm font-mono font-bold text-gray-400 uppercase tracking-widest mb-4">
            Top Active Wallets
          </h2>
          {/* BUG: Bar chart uses hardcoded domain [0, 15000] — if a wallet
              has more transactions the bar will overflow. Use 'auto' or
              compute max dynamically. */}
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topWallets} layout="vertical">
              <XAxis type="number" domain={[0, 15000]} hide />
              <YAxis
                type="category"
                dataKey="label"
                width={100}
                tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'monospace' }}
              />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontFamily: 'monospace' }}
                formatter={(v) => [`${v.toLocaleString()} txns`]}
              />
              <Bar dataKey="txCount" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
