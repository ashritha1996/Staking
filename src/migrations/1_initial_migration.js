const StakingPlatform = artifacts.require("StakingPlatform");
const ethers = require("ethers");

// funding the contract account with 10ETH initially
module.exports = function (deployer) {
  const initialFund = ethers.utils.parseEther("10");
  deployer.deploy(StakingPlatform, {value: initialFund});
};
