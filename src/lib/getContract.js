// lib/getContract.js
import SYCoinArtifact from "../contracts/SYCoin.json";

export async function getSYCoinContract(web3) {
  const netId = await web3.eth.net.getId(); // networkId (Truffle)
  const networks = SYCoinArtifact.networks || {};
  const net = networks[netId];

  if (!net || !net.address) {
    throw new Error(
      `Alamat kontrak tidak ditemukan untuk networkId ${netId}. ` +
        `Jalankan truffle migrate --reset pada network ini.`
    );
  }

  const abi = SYCoinArtifact.abi;
  return new web3.eth.Contract(abi, net.address);
}
