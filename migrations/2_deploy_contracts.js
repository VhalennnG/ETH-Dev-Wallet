const SYCoin = artifacts.require("SYCoin");

module.exports = async function (deployer, network, accounts) {
  const initialSupply = "10";
  await deployer.deploy(SYCoin, initialSupply);

  const syc = await SYCoin.deployed();
  console.log("SYCoin deployed to:", syc.address);

  const balance = await syc.balanceOf(accounts[0]);
  console.log("Owner balance:", balance.toString());
};
