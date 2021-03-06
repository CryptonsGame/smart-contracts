pragma solidity ^0.4.18;

import "../zeppelin-solidity/ERC20/ERC20.sol";
import "../zeppelin-solidity/crowdsale/CappedCrowdsale.sol";


contract CappedCrowdsaleImpl is CappedCrowdsale {

  function CappedCrowdsaleImpl (
    uint256 _rate,
    address _wallet,
    ERC20 _token,
    uint256 _cap
  ) 
    public
    Crowdsale(_rate, _wallet, _token)
    CappedCrowdsale(_cap)
  {
  }

}
