pragma solidity ^0.4.18;

import "../zeppelin-solidity/ERC20/BurnableToken.sol";


contract BurnableTokenMock is BurnableToken {

  function BurnableTokenMock(address initialAccount, uint initialBalance) public {
    balances[initialAccount] = initialBalance;
    totalSupply_ = initialBalance;
  }

}
