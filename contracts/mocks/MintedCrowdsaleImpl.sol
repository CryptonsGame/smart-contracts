pragma solidity ^0.4.18;

import "../zeppelin-solidity/ERC20/MintableToken.sol";
import "../zeppelin-solidity/crowdsale/MintedCrowdsale.sol";


contract MintedCrowdsaleImpl is MintedCrowdsale {

  function MintedCrowdsaleImpl (
    uint256 _rate,
    address _wallet,
    MintableToken _token
  ) 
    public
    Crowdsale(_rate, _wallet, _token)
  {
  }

}
