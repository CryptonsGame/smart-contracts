pragma solidity ^0.4.18;

import "../zeppelin-solidity/ERC20/StandardToken.sol";

// mock class using StandardToken
contract StandardTokenMock is StandardToken {

  function StandardTokenMock(address initialAccount, uint256 initialBalance) public {
    balances[initialAccount] = initialBalance;
    totalSupply_ = initialBalance;
  }

}
