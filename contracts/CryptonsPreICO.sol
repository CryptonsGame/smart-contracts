pragma solidity ^0.4.21;

import "./QuintessenceToken.sol";
import "./zeppelin-solidity/SafeMath.sol";
import "./zeppelin-solidity/crowdsale/CappedCrowdsale.sol";
import "./zeppelin-solidity/crowdsale/MintedCrowdsale.sol";
import "./zeppelin-solidity/crowdsale/TimedCrowdsale.sol";
import "./zeppelin-solidity/crowdsale/RefundableCrowdsale.sol";

contract DiscountedPreICO is TimedCrowdsale {
  using SafeMath for uint256;
  
  function DiscountedPreICO(uint256 _opening_time, uint256 _closing_time) 
      TimedCrowdsale(_opening_time, _closing_time) public {
  }
  
  
  function _getTokenAmount(uint256 _weiAmount) internal view returns (uint256) {
     return _weiAmount.mul(rate).mul(100).div(100 - _getCurrentDiscount());
  }
  
  /**
   * returns discount for the current time.
   */
  function _getCurrentDiscount() internal view returns(uint256) {
    return 0;
  }
}

contract AbstractCryptonsPreICO is RefundableCrowdsale, DiscountedPreICO,
                                   MintedCrowdsale, CappedCrowdsale {
  
  function AbstractCryptonsPreICO(uint256 _opening_time, uint256 _closing_time, 
                                  uint256 _rate, address _wallet, AbstractQuintessenceToken _token,
                                  uint256 _soft_cap, uint256 _hard_cap)
        RefundableCrowdsale(_soft_cap)
        DiscountedPreICO(_opening_time, _closing_time)
        CappedCrowdsale(_hard_cap)
        Crowdsale(_rate, _wallet, _token) public {
    require(_soft_cap < _hard_cap);
  }

  function finalization() internal {
    super.finalization();
    QuintessenceToken(token).transferOwnership(msg.sender);
  }
}

contract AbstractCryptonsPreICOWithDiscount is AbstractCryptonsPreICO {

    function AbstractCryptonsPreICOWithDiscount(
        uint256 _opening_time, uint256 _closing_time,
        uint256 _rate, address _wallet, AbstractQuintessenceToken _token,
        uint256 _soft_cap, uint256 _hard_cap)
      AbstractCryptonsPreICO(_opening_time, _closing_time,
                             _rate, _wallet, _token,
                             _soft_cap, _hard_cap) public {
    }

    function _getCurrentDiscount() internal view returns(uint256) {
      if (now < openingTime + 1 weeks)
        return 50;
      if (now < openingTime + 2 weeks)
        return 40;
      return 0;
    }
}

contract CryptonsPreICO is AbstractCryptonsPreICOWithDiscount {

  uint256 public constant OPENING_TIME = 1523880000; // 04/16/2018 @ 12:00pm (UTC)
  uint256 public constant CLOSING_TIME = 1525132800; // 04/30/2018 @ 11:59pm (UTC) + 1s
  uint256 public constant ETH_TO_CRYPTONS_TOKEN_RATE = 1000;
  uint256 public constant SOFT_CAP = 625 ether;
  uint256 public constant HARD_CAP = 2500 ether;

  function CryptonsPreICO(address _wallet, QuintessenceToken _token)
      AbstractCryptonsPreICOWithDiscount(OPENING_TIME, CLOSING_TIME,
                                         ETH_TO_CRYPTONS_TOKEN_RATE,
                                         _wallet, _token,
                                         SOFT_CAP, HARD_CAP) public {
      // Check if we didn't set up the opening and closing time to far in
      // the future by accident.
      require(now + 1 weeks > openingTime);
      require(openingTime + 3 weeks > closingTime);
  }

}
