const Transfer = artifacts.require("FundTransfer");

module.exports = function (deployer) {
    deployer.deploy(Transfer);
};