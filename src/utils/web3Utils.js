// src/utils/web3Utils.js
import Web3 from "web3";
import SYCoin from "../contracts/SYCoin.json";

export const connectWallet = async () => {
  if (typeof window.ethereum === "undefined") {
    throw new Error("MetaMask not installed");
  }

  const web3 = new Web3(window.ethereum);
  await window.ethereum.request({ method: "eth_requestAccounts" });
  const accounts = await web3.eth.getAccounts();

  const networkId = await web3.eth.net.getId();
  const deployedNetwork = SYCoin.networks[networkId];

  if (!deployedNetwork) {
    throw new Error("Contract not deployed to detected network");
  }

  const contract = new web3.eth.Contract(SYCoin.abi, deployedNetwork.address);
  const balance = await contract.methods.balanceOf(accounts[0]).call();

  return {
    account: accounts[0],
    contract,
    balance: Web3.utils.fromWei(balance, "ether"),
  };
};

export const getBalance = async (contract, address) => {
  const balance = await contract.methods.balanceOf(address).call();
  return Web3.utils.fromWei(balance, "ether");
};

export const transferTokens = async (contract, from, to, amount) => {
  const web3 = new Web3(window.ethereum);
  const amountInWei = web3.utils.toWei(amount.toString(), "ether");

  await contract.methods.transfer(to, amountInWei).send({
    from,
    gas: 100000,
    gasPrice: await web3.eth.getGasPrice(),
  });
};
