"use client";
import React, { useState } from "react";
import {
  connectWallet,
  getBalance,
  transferTokens,
  sellSYCForETH,
} from "../utils/web3Utils";
import { Shield, Wallet, ArrowRightLeft } from "lucide-react";

export default function Home() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState("0");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    try {
      const { account, contract, balance } = await connectWallet();
      setAccount(account);
      setContract(contract);
      setBalance(balance);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await transferTokens(contract, account, recipient, amount);
      const newBalance = await getBalance(contract, account);
      setBalance(newBalance);
      setRecipient("");
      setAmount("");
      alert("Transfer successful!");
    } catch (error) {
      console.error("Transfer error:", error);
      alert("Transfer failed: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8'>
      {/* Animated background grid */}
      <div className='fixed inset-0 opacity-20'>
        <div className='absolute inset-0 grid grid-cols-12 gap-4'>
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className='h-full w-px bg-cyan-500/10 animate-pulse'
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
        <div className='absolute inset-0 grid grid-rows-12 gap-4'>
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className='w-full h-px bg-purple-500/10 animate-pulse'
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>

      <div className='max-w-xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-12'>
          <div className='flex items-center justify-center mb-4'>
            <Shield className='w-12 h-12 text-cyan-400' />
          </div>
          <h1 className='text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400'>
            SY COIN
          </h1>
          <p className='text-cyan-400 mt-2 tracking-widest'>
            SECURE TRANSACTION INTERFACE
          </p>
        </div>

        <div className='bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700 shadow-2xl p-8'>
          {!account ? (
            <button
              onClick={handleConnect}
              className='w-full group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105'>
              <div className='absolute inset-0 bg-white/20 translate-y-12 group-hover:translate-y-0 transition-transform duration-300' />
              <div className='relative flex items-center justify-center gap-3'>
                <Wallet className='w-6 h-6' />
                <span className='font-semibold'>CONNECT WALLET</span>
              </div>
            </button>
          ) : (
            <div className='space-y-6'>
              {/* Account Info */}
              <div className='p-4 rounded-lg bg-gray-900/50 border border-gray-700'>
                <p className='text-cyan-400 text-xs mb-1'>CONNECTED WALLET</p>
                <p className='font-mono text-gray-300 text-sm truncate'>
                  {account}
                </p>
              </div>

              {/* Balance */}
              <div className='p-4 rounded-lg bg-gray-900/50 border border-gray-700'>
                <p className='text-purple-400 text-xs mb-1'>BALANCE</p>
                <p className='text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400'>
                  {balance} SYC
                </p>
              </div>

              {/* Transfer Form */}
              <form onSubmit={handleTransfer} className='space-y-4'>
                <div>
                  <label className='text-cyan-400 text-xs'>RECIPIENT ID</label>
                  <input
                    type='text'
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className='mt-1 w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-gray-300 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all'
                    required
                  />
                </div>

                <div>
                  <label className='text-purple-400 text-xs'>AMOUNT</label>
                  <input
                    type='number'
                    step='0.000000000000000001'
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className='mt-1 w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-gray-300 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all'
                    required
                  />
                </div>

                <button
                  type='submit'
                  disabled={loading}
                  className='w-full group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100'>
                  <div className='absolute inset-0 bg-white/20 translate-y-12 group-hover:translate-y-0 transition-transform duration-300' />
                  <div className='relative flex items-center justify-center gap-3'>
                    <ArrowRightLeft className='w-6 h-6' />
                    <span className='font-semibold'>
                      {loading ? "PROCESSING..." : "INITIATE TRANSFER"}
                    </span>
                  </div>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
