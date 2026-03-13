import React, { useEffect, useState } from 'react';
import { fetchWallet } from '../utils/api';

// BUG: Transactions are not paginated — this component loads all 20 at once
// and has no "Load More" or page controls. For wallets with many txns, this
// creates a long, unscrollable table. See issues.txt #4 for fix details.

const DEFAULT_WALLET = '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8';

function truncateHash(hash) {
  if (!hash) return '—';
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

function StatusBadge({ isError }) {
  // BUG: `isError` from Etherscan is a string "0" or "1", not a boolean.
  // The truthiness check of "0" is true in JS, so all txns appear as "Failed".
  // Fix: isError === '1' instead of just isError.
  return (
    <span
      className={`text-xs font-mono px-2 py-0.5 rounded-full ${
        isError ? 'bg-red-900/40 text-red-400' : 'bg-emerald-900/40 text-emerald-400'
      }`}
    >
      {isError ? 'Failed' : 'Success'}
    </span>
  );
}

function TxRow({ tx }) {
  const ethValue = (parseInt(tx.value) / 1e18).toFixed(6);
  const gasUsed = tx.gasUsed;
  // BUG: Date is computed incorrectly — tx.timeStamp is Unix seconds (string).
  // new Date(tx.timeStamp) treats it as milliseconds, giving wrong dates (year 1970).
  // Fix: new Date(parseInt(tx.timeStamp) * 1000)
  const date = new Date(tx.timeStamp).toLocaleDateString();

  return (
    <tr className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors">
      <td className="py-3 px-4 font-mono text-xs text-emerald-400">
        <a
          href={`https://etherscan.io/tx/${tx.hash}`}
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
        >
          {truncateHash(tx.hash)}
        </a>
      </td>
      <td className="py-3 px-4 font-mono text-xs text-gray-400">{truncateHash(tx.from)}</td>
      <td className="py-3 px-4 font-mono text-xs text-gray-400">{truncateHash(tx.to)}</td>
      <td className="py-3 px-4 font-mono text-xs text-white">{ethValue} ETH</td>
      <td className="py-3 px-4 font-mono text-xs text-gray-500">{gasUsed}</td>
      <td className="py-3 px-4">
        <StatusBadge isError={tx.isError} />
      </td>
      <td className="py-3 px-4 font-mono text-xs text-gray-600">{date}</td>
    </tr>
  );
}

export default function TransactionTable({ wallet }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // TODO: Implement pagination state: const [page, setPage] = useState(1);

  const targetWallet = wallet || DEFAULT_WALLET;

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchWallet(targetWallet);
        setTransactions(data.transactions || []);
      } catch (e) {
        setError('Failed to load transactions.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [targetWallet]);

  // TODO: Add CSV export function
  // const exportCsv = () => { ... }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 font-mono animate-pulse">
        Fetching transactions...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black font-mono text-white mb-1">Transaction History</h1>
          <p className="text-gray-500 font-mono text-sm">
            Wallet: <span className="text-emerald-400">{truncateHash(targetWallet)}</span>
          </p>
        </div>
        {/* TODO: Wire up CSV export button */}
        <button
          disabled
          className="px-4 py-2 border border-gray-700 rounded-lg text-sm font-mono text-gray-500 cursor-not-allowed"
          title="Coming soon"
        >
          Export CSV
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 font-mono text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/80">
                {['Tx Hash', 'From', 'To', 'Value', 'Gas Used', 'Status', 'Date'].map((col) => (
                  <th
                    key={col}
                    className="py-3 px-4 text-left text-xs font-mono font-bold text-gray-500 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-600 font-mono text-sm">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((tx, i) => <TxRow key={tx.hash || i} tx={tx} />)
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TODO: Add pagination controls here */}
      {/* <div className="flex justify-between items-center">
        <button onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</button>
        <span>Page {page}</span>
        <button onClick={() => setPage(p => p + 1)}>Next</button>
      </div> */}
    </div>
  );
}
