var Energy = artifacts.require("./Energy.sol");

module.exports = function(deployer) {
  deployer.deploy(Energy);
};
