pragma solidity ^0.4.18;

import "../zeppelin-solidity/ERC20/MintableToken.sol";
import "../zeppelin-solidity/crowdsale/FinalizableCrowdsale.sol";


contract FinalizableCrowdsaleImpl is FinalizableCrowdsale {

  function FinalizableCrowdsaleImpl (
    uint256 _openingTime,
    uint256 _closingTime,
    uint256 _rate,
    address _wallet,
    MintableToken _token
  ) 
    public
    Crowdsale(_rate, _wallet, _token)
    TimedCrowdsale(_openingTime, _closingTime)
  {
  }

}
