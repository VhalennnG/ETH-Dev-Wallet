"use client";

import { useEffect, useMemo, useState } from "react";
import { Web3 } from "web3";
import {
  ArrowPathIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";

const DEFAULT_RPC =
  process.env.NEXT_PUBLIC_GANACHE_RPC || "http://127.0.0.1:8545";

function toError(e) {
  if (!e) return "Unknown error";
  if (typeof e === "string") return e;
  if (e?.message) return e.message;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

function parseUnitsDecimal(amountStr, decimals = 18) {
  const [intPart = "0", fracPartRaw = ""] = String(amountStr).trim().split(".");
  const fracPart = fracPartRaw.slice(0, decimals);
  const paddedFrac = fracPart.padEnd(decimals, "0");
  const full = `${intPart}${paddedFrac}`;
  if (!/^\d+$/.test(full)) throw new Error("Nilai tidak valid");
  return BigInt(full || "0");
}

function formatUnits(bi, decimals = 18, maxFrac = 6) {
  const s = bi.toString();
  const len = s.length;
  const whole = len > decimals ? s.slice(0, len - decimals) : "0";
  const frac = (
    len > decimals ? s.slice(len - decimals) : s.padStart(decimals, "0")
  ).replace(/0+$/, "");
  const fracShown = frac.slice(0, maxFrac);
  return fracShown.length ? `${whole}.${fracShown}` : whole;
}

export default function HomePage() {
  const [rpcUrl, setRpcUrl] = useState(DEFAULT_RPC);
  const [web3, setWeb3] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [blockNumber, setBlockNumber] = useState(null);
  const [gasPrice, setGasPrice] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [transferring, setTransferring] = useState(false);

  const [accounts, setAccounts] = useState([]);
  const [balances, setBalances] = useState({});
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("info"); // info, success, error

  const connect = async () => {
    setStatus("");
    setStatusType("info");
    setConnecting(true);
    try {
      const w3 = new Web3(rpcUrl);
      const [cid, bn, gp] = await Promise.all([
        w3.eth.getChainId(),
        w3.eth.getBlockNumber(),
        w3.eth.getGasPrice(),
      ]);
      setWeb3(w3);
      setChainId(Number(cid));
      setBlockNumber(Number(bn));
      setGasPrice(BigInt(gp));

      const accs = await w3.eth.getAccounts();
      setAccounts(accs);
      setStatus(
        `Connected to ${rpcUrl} (chainId ${cid}). Found ${accs.length} account.`
      );
      setStatusType("success");
    } catch (e) {
      setStatus(`Fail to connect: ${toError(e)}`);
      setStatusType("error");
      setWeb3(null);
      setChainId(null);
      setBlockNumber(null);
      setGasPrice(null);
      setAccounts([]);
    } finally {
      setConnecting(false);
    }
  };

  const refreshBalances = async () => {
    if (!web3 || accounts.length === 0) return;
    setRefreshing(true);
    try {
      const next = {};
      await Promise.all(
        accounts.map(async (addr) => {
          const ethBal = await web3.eth.getBalance(addr);
          next[addr] = {
            eth: BigInt(ethBal),
          };
        })
      );
      setBalances(next);
      setStatus("Balances diperbarui.");
      setStatusType("success");
    } catch (e) {
      setStatus(`Gagal ambil balances: ${toError(e)}`);
      setStatusType("error");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (rpcUrl) connect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (accounts.length) refreshBalances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts]);

  const [fromEth, setFromEth] = useState("");
  const [toEth, setToEth] = useState("");
  const [amountEth, setAmountEth] = useState("");

  const doTransferEth = async () => {
    try {
      if (!web3) throw new Error("Not connected.");
      if (!fromEth || !toEth) throw new Error("Pilih akun asal & tujuan.");
      if (!amountEth) throw new Error("Isi jumlah ETH.");
      const wei = parseUnitsDecimal(amountEth, 18);
      setTransferring(true);
      setStatus("Mengirim transaksi ETH...");
      setStatusType("info");
      const tx = await web3.eth.sendTransaction({
        from: fromEth,
        to: toEth,
        value: wei.toString(),
      });
      setStatus(
        `Transfer ETH sukses. Tx: ${
          tx?.transactionHash || "(hash tidak tersedia)"
        }`
      );
      setStatusType("success");
      await refreshBalances();
      setAmountEth("");
    } catch (e) {
      setStatus(`Gagal transfer ETH: ${toError(e)}`);
      setStatusType("error");
    } finally {
      setTransferring(false);
    }
  };

  const renderAccountSelect = (value, onChange, id) => (
    <select
      id={id}
      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="" className="text-gray-700">
        -- Choose Account --
      </option>
      {accounts.map((a) => (
        <option key={a} value={a} className="text-gray-900">
          {a.slice(0, 6)}...{a.slice(-4)}
        </option>
      ))}
    </select>
  );

  const renderBalancesTable = () => (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
            >
              #
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
            >
              Address
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
            >
              ETH Balance
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {accounts.map((a, idx) => {
            const b = balances[a] || { eth: 0n };
            return (
              <tr key={a} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {idx}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                  {a}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                  {formatUnits(BigInt(b.eth || 0n), 18, 6)} ETH
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const getStatusIcon = () => {
    switch (statusType) {
      case "success":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case "error":
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <WalletIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            ETH Dashboard
          </h1>
          <p className="text-lg text-gray-700">
            Interacting with Ganache using web3.js
          </p>
        </div>

        <div className="space-y-8">
          {/* Connection Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <WalletIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Connect to Ganache
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Chain ID</p>
                <p className="text-lg font-semibold text-gray-900">
                  {chainId ?? "-"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Block Number</p>
                <p className="text-lg font-semibold text-gray-900">
                  {blockNumber ?? "-"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Gas Price (wei)</p>
                <p className="text-lg font-semibold text-gray-900">
                  {gasPrice?.toString() ?? "-"}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={rpcUrl}
                onChange={(e) => setRpcUrl(e.target.value)}
                placeholder="http://127.0.0.1:8545"
                className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
              />
              <button
                onClick={connect}
                disabled={connecting}
                className={`px-6 py-3 rounded-lg font-medium flex items-center justify-center transition-all text-white ${
                  connecting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {connecting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Connecting...
                  </>
                ) : (
                  "Connect"
                )}
              </button>
            </div>
          </div>

          {/* Accounts Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <WalletIcon className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Account & Balance
                </h2>
              </div>
              <button
                onClick={refreshBalances}
                disabled={refreshing || !accounts.length}
                className={`px-4 py-2 rounded-lg flex items-center transition-all text-white ${
                  refreshing || !accounts.length
                    ? "bg-gray-400"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {refreshing ? (
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <ArrowPathIcon className="h-4 w-4 mr-1" />
                )}
                Refresh
              </button>
            </div>

            {accounts.length ? (
              renderBalancesTable()
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  No account found. Make sure Ganache is running.
                </p>
              </div>
            )}
          </div>

          {/* Transfer Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-2 rounded-lg mr-3">
                <ArrowUpTrayIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Transfer ETH</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From
                </label>
                {renderAccountSelect(fromEth, setFromEth, "fromEth")}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To
                </label>
                {renderAccountSelect(toEth, setToEth, "toEth")}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total (ETH)
                </label>
                <input
                  type="text"
                  value={amountEth}
                  onChange={(e) => setAmountEth(e.target.value)}
                  placeholder="0.1"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-gray-900"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={doTransferEth}
                disabled={!web3 || !accounts.length || transferring}
                className={`px-6 py-3 rounded-lg font-medium flex items-center transition-all text-white ${
                  !web3 || !accounts.length || transferring
                    ? "bg-gray-400"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                {transferring ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowUpTrayIcon className="h-4 w-4 mr-1" />
                    Send ETH
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Status Card */}
          <div
            className={`rounded-xl shadow-lg p-6 border ${
              statusType === "success"
                ? "bg-green-50 border-green-200"
                : statusType === "error"
                ? "bg-red-50 border-red-200"
                : "bg-blue-50 border-blue-200"
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">{getStatusIcon()}</div>
              <div className="ml-3">
                <h3
                  className={`text-sm font-medium ${
                    statusType === "success"
                      ? "text-green-800"
                      : statusType === "error"
                      ? "text-red-800"
                      : "text-blue-800"
                  }`}
                >
                  Status
                </h3>
                <div
                  className={`mt-2 text-sm ${
                    statusType === "success"
                      ? "text-green-700"
                      : statusType === "error"
                      ? "text-red-700"
                      : "text-blue-700"
                  }`}
                >
                  {status || "-"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
