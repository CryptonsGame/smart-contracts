import ether from './helpers/ether';
import { advanceBlock } from './helpers/advanceToBlock';
import { increaseTime, increaseTimeTo, duration } from './helpers/increaseTime';
import latestTime from './helpers/latestTime';

const BigNumber = web3.BigNumber;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const AbstractCryptonsPreICOWithDiscount = artifacts.require('AbstractCryptonsPreICOWithDiscount');
const AbstractQuintessenceToken = artifacts.require('AbstractQuintessenceToken');

contract('AbstractCryptonsPreICOWithDiscount', function ([_, investor, wallet, purchaser]) {
  const rate = new BigNumber(1);
  const value = ether(1);
  const tokenSupply = new BigNumber('1e22');
  const expectedTokenAmount = rate.mul(value);

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach(async function () {
    this.openingTime = latestTime() + duration.seconds(10);
    this.closingTime = this.openingTime + duration.weeks(5);
    this.afterClosingTime = this.closingTime + duration.seconds(1);
    this.token = await AbstractQuintessenceToken.new(tokenSupply, 42*tokenSupply);
    this.crowdsale = await AbstractCryptonsPreICOWithDiscount.new(
        this.openingTime, this.closingTime, rate, wallet, this.token.address, ether(42), ether(43));
    await this.token.transferOwnership(this.crowdsale.address);
    await increaseTimeTo(this.openingTime);
  });

  
  describe('Calculating discounts', function () {

    function test(timeOffset, discount) {
        it('should correctly apply the ' + discount + ' discount', async function () {
            await increaseTimeTo(this.openingTime + timeOffset);
            await this.crowdsale.buyTokens(investor, { value, from: purchaser });
            const balance = await this.token.balanceOf(investor);
            balance.should.be.bignumber.equal(expectedTokenAmount.mul(100).dividedToIntegerBy(100 - discount));

            const currentDiscount = await this.crowdsale.getCurrentDiscount();
            currentDiscount.should.be.bignumber.equal(discount);
        });
    }
    // We need to add 3 seconds, because the framework is so slow that timestamp
    // changes while running it.
    test(duration.seconds(3), 50);
    test(duration.weeks(1), 40);
    test(duration.weeks(2), 0);
  });
  
  
  
});
