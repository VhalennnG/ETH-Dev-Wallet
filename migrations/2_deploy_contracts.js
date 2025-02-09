const SYCoin = artifacts.require("SYCoin");

module.exports = async function (deployer, network, accounts) {
  // Deploy dengan initial supply 1,000,000 SYC
  const initialSupply = "100000000000000000000";
  await deployer.deploy(SYCoin, initialSupply);

  const syc = await SYCoin.deployed();
  console.log("SYCoin deployed to:", syc.address);

  // Log balance pembuat kontrak
  const balance = await syc.balanceOf(accounts[0]);
  console.log("Owner balance:", balance.toString());
};
