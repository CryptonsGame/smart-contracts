pragma solidity ^0.4.18;

import "../zeppelin-solidity/ERC20/MintableToken.sol";
import "../zeppelin-solidity/crowdsale/RefundableCrowdsale.sol";

contract RefundableCrowdsaleImpl is RefundableCrowdsale {

  function RefundableCrowdsaleImpl (
    uint256 _openingTime,
    uint256 _closingTime,
    uint256 _rate,
    address _wallet,
    MintableToken _token,
    uint256 _goal
  ) 
    public
    Crowdsale(_rate, _wallet, _token)
    TimedCrowdsale(_openingTime, _closingTime)
    RefundableCrowdsale(_goal)
  {
  }

}
