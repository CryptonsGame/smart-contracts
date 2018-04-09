pragma solidity ^0.4.21;

import "./zeppelin-solidity/ERC20/CappedToken.sol";
import "./zeppelin-solidity/ERC20/BurnableToken.sol";
import "./zeppelin-solidity/ERC827/ERC827Token.sol";


contract AbstractQuintessenceToken is CappedToken, ERC827Token, BurnableToken {
  string public name = "Quintessence Token";
  string public symbol = "QST";

  function AbstractQuintessenceToken(uint256 initial_supply, uint256 _cap)
        CappedToken(_cap) public {
    totalSupply_ = initial_supply;
    balances[msg.sender] = initial_supply;
  }
}

contract QuintessenceToken is AbstractQuintessenceToken {
  uint256 public constant decimals = 18;
  uint256 public constant TOKEN_CAP = 58000000 * (10 ** decimals);
  // Allocate 4% of TOKEN_CAP to the team.
  uint256 public constant INITIAL_SUPPLY = (TOKEN_CAP * 4) / 100;


  function QuintessenceToken() AbstractQuintessenceToken(INITIAL_SUPPLY, TOKEN_CAP) public {
  }
}
