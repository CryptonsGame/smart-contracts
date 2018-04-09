pragma solidity ^0.4.18;

import "../zeppelin-solidity/ERC20/ERC20.sol";
import "../zeppelin-solidity/crowdsale/TimedCrowdsale.sol";

contract TimedCrowdsaleImpl is TimedCrowdsale {

  function TimedCrowdsaleImpl (
    uint256 _openingTime,
    uint256 _closingTime,
    uint256 _rate,
    address _wallet,
    ERC20 _token
  ) 
    public
    Crowdsale(_rate, _wallet, _token)
    TimedCrowdsale(_openingTime, _closingTime)
  {
  }

}
