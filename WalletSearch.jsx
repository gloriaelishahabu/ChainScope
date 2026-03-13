import React, { useState } from 'react';
import { fetchWallet } from '../utils/api';

// BUG: Address validation only checks length, not the 0x prefix or hex chars.
// A 42-character non-address string like "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA!!" passes.
// Use: /^0x[a-fA-F0-9]{40}$/.test(address)
function isValidAddress(address) {
  return address.length === 42;
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    // TODO: Reset after timeout — currently stays "Copied!" forever
    // Fix: setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-xs font-mono text-gray-500 hover:text-emerald-400 transition-colors ml-2"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

function WalletCard({ data }) {
  const txs = data.transactions || [];
  const total = txs.length;

  // BUG: ETH value is in Wei (string from Etherscan), not ETH.
  // Displaying raw value misleads users. Should divide by 1e18.
  const totalValue = txs.reduce((sum, tx) => sum + Number(tx.value), 0);

  return (
    <div className="bg-gray-900 border border-emerald-800/40 rounded-xl p-6 space-y-4">
      <div>
        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Wallet Address</p>
        <div className="flex items-center">
          <span className="font-mono text-emerald-400 text-sm break-all">{data.address}</span>
          <CopyButton text={data.address} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-xs text-gray-500 font-mono mb-1">Transactions Found</p>
          <p className="text-2xl font-black font-mono text-white">{total}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-xs text-gray-500 font-mono mb-1">Total ETH Value</p>
          {/* BUG: totalValue is in Wei, not ETH — shows astronomically wrong numbers */}
          <p className="text-2xl font-black font-mono text-amber-400">
            {(totalValue / 1e18).toFixed(4)} ETH
          </p>
        </div>
      </div>
    </div>
  );
}

export default function WalletSearch({ onSelect }) {
  const [address, setAddress] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    setError(null);
    setResult(null);

    if (!isValidAddress(address.trim())) {
      setError('Invalid Ethereum address.');
      return;
    }

    setLoading(true);
    try {
      const data = await fetchWallet(address.trim());
      setResult(data);
      if (onSelect) onSelect(address.trim());
    } catch (e) {
      // BUG: Error message from the API is not shown — always shows generic message.
      // Should display e.response?.data?.error or e.message.
      setError('Could not fetch wallet data. Check the address or API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    // TODO: Add keyboard shortcut (Cmd+K or /) to focus the search bar
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black font-mono text-white mb-1">Wallet Lookup</h1>
        <p className="text-gray-500 font-mono text-sm">Search any Ethereum wallet by address</p>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="0x..."
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 font-mono text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-700 text-gray-950 font-bold font-mono rounded-lg transition-colors text-sm"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 font-mono text-sm text-red-400">
          {error}
        </div>
      )}

      {result && <WalletCard data={result} />}

      {/* Quick examples */}
      <div className="border-t border-gray-800 pt-4">
        <p className="text-xs font-mono text-gray-600 mb-2">Example addresses:</p>
        <div className="flex flex-wrap gap-2">
          {[
            '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8',
            '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE',
          ].map((addr) => (
            <button
              key={addr}
              onClick={() => setAddress(addr)}
              className="text-xs font-mono text-gray-500 hover:text-emerald-400 transition-colors truncate max-w-xs"
            >
              {addr.slice(0, 16)}...
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
