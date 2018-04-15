var QuintessenceToken = artifacts.require("QuintessenceToken");
var CryptonsPreICO = artifacts.require("CryptonsPreICO");


module.exports = async function(deployer, network, accounts) {
    if (network == "coverage")
        return;
    var account = accounts[1];
    console.log("Deploying from: " + account);

    await deployer.deploy(QuintessenceToken, { from: account });
    var token = QuintessenceToken.at(QuintessenceToken.address);

    await deployer.deploy(CryptonsPreICO, account, QuintessenceToken.address, { from: account });

    await token.transferOwnership(CryptonsPreICO.address, { from: account });

    console.log("QuintesenceToken addr: " + QuintessenceToken.address);
    console.log("CryptonsPreICO addr: " + CryptonsPreICO.address);

};

