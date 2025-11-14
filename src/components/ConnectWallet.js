// components/ConnectWallet.jsx
"use client";

import React, { useEffect, useState } from "react";
import Web3 from "web3";
import { getEthereum, makeWeb3, requestAccountsPicker } from "../lib/web3";
import { getSYCoinContract } from "../lib/getContract";
import AccountPicker from "./AccountPicker";

export default function ConnectWallet() {
  const [web3, setWeb3] = useState(null);
  const [chain, setChain] = useState(null); // { chainIdHex, chainIdDec, netId }
  const [accounts, setAccounts] = useState([]);
  const [active, setActive] = useState(null);
  const [contractAddr, setContractAddr] = useState("");
  const [balance, setBalance] = useState("0");

  useEffect(() => {
    const ethereum = getEthereum();
    if (!ethereum) return;

    const w3 = makeWeb3();
    setWeb3(w3);

    const onAccountsChanged = (accs) => {
      setAccounts(accs || []);
      setActive(accs && accs.length ? accs[0] : null);
    };
    const onChainChanged = async () => {
      await refreshNetworkAndContract();
    };

    ethereum.on?.("accountsChanged", onAccountsChanged);
    ethereum.on?.("chainChanged", onChainChanged);

    return () => {
      ethereum.removeListener?.("accountsChanged", onAccountsChanged);
      ethereum.removeListener?.("chainChanged", onChainChanged);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshNetworkAndContract = async () => {
    if (!web3) return;
    const chainIdDec = await web3.eth.getChainId();
    const chainIdHex = "0x" + chainIdDec.toString(16);
    const netId = await web3.eth.net.getId(); // dipakai oleh Truffle artifact
    setChain({ chainIdHex, chainIdDec, netId });

    try {
      const c = await getSYCoinContract(web3);
      setContractAddr(c.options.address);
    } catch (e) {
      setContractAddr("");
      console.warn(e && e.message ? e.message : e);
    }
  };

  const connectWithPicker = async () => {
    const accs = await requestAccountsPicker();
    setAccounts(accs);
    setActive(accs[0] || null);
    await refreshNetworkAndContract();
  };

  const switchAccount = (acc) => {
    setActive(acc); 
  };

  const readBalance = async () => {
    if (!web3 || !active) return;
    const bal = await web3.eth.getBalance(active);
    setBalance(Web3.utils.fromWei(bal, "ether"));
  };

  const buySYC = async (ethAmount) => {
    if (!web3 || !active) return;
    const c = await getSYCoinContract(web3);
    await c.methods.buySYC().send({
      from: active,
      value: Web3.utils.toWei(ethAmount, "ether"),
    });
  };

  const sellSYC = async (sycHuman) => {
    if (!web3 || !active) return;
    const c = await getSYCoinContract(web3);
    const amount = Web3.utils.toWei(sycHuman, "ether"); 
    await c.methods.sellSYC(amount).send({ from: active });
  };

  return (
    <div className="p-4 border rounded-lg space-y-3 max-w-xl">
      <h2 className="font-semibold text-lg">SY Coin DApp (web3.js)</h2>

      {!accounts.length ? (
        <button
          onClick={connectWithPicker}
          className="px-3 py-2 bg-black text-white rounded"
        >
          Connect & Pilih Akun
        </button>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <AccountPicker
              accounts={accounts}
              active={active}
              onSelect={switchAccount}
            />
            <button
              onClick={connectWithPicker}
              className="px-2 py-1 border rounded"
              title="Ganti pilihan akun di MetaMask"
            >
              Ganti Akun…
            </button>
          </div>

          <div className="text-sm space-y-1">
            <div>
              Active: <code>{active}</code>
            </div>
            <div>
              Chain:{" "}
              {chain
                ? `chainId=${chain.chainIdDec} (hex ${chain.chainIdHex}), netId=${chain.netId}`
                : "—"}
            </div>
            <div>
              Kontrak SYCoin:{" "}
              {contractAddr ? (
                <code>{contractAddr}</code>
              ) : (
                <em>Belum ditemukan (deploy di network ini?)</em>
              )}
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <button onClick={readBalance} className="px-2 py-1 border rounded">
              Cek Saldo ETH
            </button>
            <div>Saldo: {balance} ETH</div>
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={() => buySYC("0.1")}
              className="px-2 py-1 border rounded"
            >
              Beli 0.1 ETH → SYC
            </button>
            <button
              onClick={() => sellSYC("0.1")}
              className="px-2 py-1 border rounded"
            >
              Jual 0.1 SYC → ETH
            </button>
          </div>
        </>
      )}
    </div>
  );
}
