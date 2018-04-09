var QuintessenceToken = artifacts.require("QuintessenceToken");
var CryptonsPreICO = artifacts.require("CryptonsPreICO");


module.exports = async function(deployer, network, accounts) {
    if (network == "coverage")
        return;
    console.log("Deploying from: " + accounts[0]);

    await deployer.deploy(QuintessenceToken);
    var token = QuintessenceToken.at(QuintessenceToken.address);

    await deployer.deploy(CryptonsPreICO, accounts[0], QuintessenceToken.address);

    await token.transferOwnership(CryptonsPreICO.address, { from: accounts[0] });

    console.log("QuintesenceToken addr: " + QuintessenceToken.address);
    console.log("CryptonsPreICO addr: " + CryptonsPreICO.address);

};

