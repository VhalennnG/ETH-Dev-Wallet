// lib/web3.js
import Web3 from "web3";

export function getEthereum() {
  if (typeof window !== "undefined" && window.ethereum) {
    return window.ethereum;
  }
  return null;
}

export function makeWeb3() {
  const ethereum = getEthereum();
  if (!ethereum) return null;
  return new Web3(ethereum);
}

export async function requestAccountsPicker() {
  const ethereum = getEthereum();
  if (!ethereum) throw new Error("MetaMask tidak terpasang.");
  // munculkan dialog pilih akun lagi
  await ethereum.request({
    method: "wallet_requestPermissions",
    params: [{ eth_accounts: {} }],
  });
  const accounts = await ethereum.request({ method: "eth_requestAccounts" });
  return accounts;
}
