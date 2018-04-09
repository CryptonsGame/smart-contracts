import ether from './helpers/ether';
import { advanceBlock } from './helpers/advanceToBlock';
import { increaseTimeTo, duration } from './helpers/increaseTime';
import latestTime from './helpers/latestTime';
import EVMRevert from './helpers/EVMRevert';

const BigNumber = web3.BigNumber;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const AbstractCryptonsPreICO = artifacts.require('AbstractCryptonsPreICO');
const AbstractQuintessenceToken = artifacts.require('AbstractQuintessenceToken');

contract('AbstractCryptonsPreICO', function ([_, owner, wallet, investor, purchaser])  {
  const rate = new BigNumber(250);
  const value = ether(0.01);
  const goal = ether(0.0050);
  const hardCap = ether(0.1000)
  const lessThanGoal = ether(0.0045);
  const tokenSupply = new BigNumber('1e22');
  const expectedTokenAmount = rate.mul(value);

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach(async function () {
    this.openingTime = latestTime() + duration.weeks(1);
    this.closingTime = this.openingTime + duration.weeks(1);
    this.afterClosingTime = this.closingTime + duration.seconds(1);
    this.token = await AbstractQuintessenceToken.new(tokenSupply, 100000*tokenSupply);
    this.crowdsale = await AbstractCryptonsPreICO.new(this.openingTime,
                                                      this.closingTime,
                                                      rate,
                                                      wallet,
                                                      this.token.address,
                                                      goal,
                                                      hardCap,
                                                      { from: owner });
    await this.token.transferOwnership(this.crowdsale.address);
  });

  describe('accepting payments', function () {

    it('should reject payments before start', async function () {
      await this.crowdsale.send(value).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(investor, { from: purchaser, value: value }).should.be.rejectedWith(EVMRevert);
    });

    it('should accept payments after start', async function () {
      await increaseTimeTo(this.openingTime);
      await this.crowdsale.send(value).should.be.fulfilled;
      await this.crowdsale.buyTokens(investor, { value: value, from: purchaser }).should.be.fulfilled;
    });

    it('should reject payments after end', async function () {
      await increaseTimeTo(this.afterClosingTime);
      await this.crowdsale.send(value).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(investor, { value: value, from: purchaser }).should.be.rejectedWith(EVMRevert);
    });

    it('should reject payments after hard cap', async function () {
      let hardCapSet = await this.crowdsale.cap();
      hardCapSet.should.be.bignumber.equal(hardCap);

      let capReached = await this.crowdsale.capReached();
      capReached.should.equal(false);
      let raised = await this.crowdsale.weiRaised();
      raised.should.be.bignumber.equal(0);

      await increaseTimeTo(this.openingTime);
      await this.crowdsale.send(hardCap + 1).should.be.rejectedWith(EVMRevert);

      await this.crowdsale.send(hardCap).should.be.fulfilled;
      capReached = await this.crowdsale.capReached();
      capReached.should.equal(true);

      raised = await this.crowdsale.weiRaised();
      raised.should.be.bignumber.equal(hardCap);

      await this.crowdsale.send(1).should.be.rejectedWith(EVMRevert);

    });
  });

  describe('high-level purchase', function () {
    it('should log purchase', async function () {
      await increaseTimeTo(this.openingTime);
      const { logs } = await this.crowdsale.sendTransaction({ value: value, from: investor });
      const event = logs.find(e => e.event === 'TokenPurchase');
      should.exist(event);
      event.args.purchaser.should.equal(investor);
      event.args.beneficiary.should.equal(investor);
      event.args.value.should.be.bignumber.equal(value);
      event.args.amount.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should assign tokens to sender', async function () {
      await increaseTimeTo(this.openingTime);
      await this.crowdsale.sendTransaction({ value: value, from: investor });
      let balance = await this.token.balanceOf(investor);
      balance.should.be.bignumber.equal(expectedTokenAmount);
    });

  });

  describe('low-level purchase', function () {
    it('should log purchase', async function () {
      await increaseTimeTo(this.openingTime);
      const { logs } = await this.crowdsale.buyTokens(investor, { value: value, from: purchaser });
      const event = logs.find(e => e.event === 'TokenPurchase');
      should.exist(event);
      event.args.purchaser.should.equal(purchaser);
      event.args.beneficiary.should.equal(investor);
      event.args.value.should.be.bignumber.equal(value);
      event.args.amount.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should assign tokens to beneficiary', async function () {
      await increaseTimeTo(this.openingTime);
      await this.crowdsale.buyTokens(investor, { value, from: purchaser });
      const balance = await this.token.balanceOf(investor);
      balance.should.be.bignumber.equal(expectedTokenAmount);
    });


  });


  it('should be ended only after end', async function () {
    await increaseTimeTo(this.openingTime);
    let ended = await this.crowdsale.hasClosed();
    ended.should.equal(false);
    await increaseTimeTo(this.afterClosingTime);
    ended = await this.crowdsale.hasClosed();
    ended.should.equal(true);
  });

  describe('forwarding funds', function() {
    it('should deny refunds before end', async function () {
      await this.crowdsale.claimRefund({ from: investor }).should.be.rejectedWith(EVMRevert);
      await increaseTimeTo(this.openingTime);
      await this.crowdsale.claimRefund({ from: investor }).should.be.rejectedWith(EVMRevert);
    });

    it('should deny refunds after end if goal was reached', async function () {
      await increaseTimeTo(this.openingTime);
      await this.crowdsale.sendTransaction({ value: goal, from: investor });
      await increaseTimeTo(this.afterClosingTime);
      await this.crowdsale.claimRefund({ from: investor }).should.be.rejectedWith(EVMRevert);
    });

    it('should deny refunds after end if goal was reached with finalization', async function () {
      await increaseTimeTo(this.openingTime);
      await this.crowdsale.sendTransaction({ value: goal, from: investor });
      await increaseTimeTo(this.afterClosingTime);
      await this.crowdsale.finalize({from : owner });
      await this.crowdsale.claimRefund({ from: investor }).should.be.rejectedWith(EVMRevert);
    });

    it('should allow refunds after end if goal was not reached', async function () {
      await increaseTimeTo(this.openingTime);
      await this.crowdsale.sendTransaction({ value: lessThanGoal, from: investor });
      await increaseTimeTo(this.afterClosingTime);

      const ownerBefore = await this.token.owner();
      ownerBefore.should.be.equal(this.crowdsale.address);
      await this.crowdsale.finalize({ from: owner });

      const ownerAfter = await this.token.owner();
      ownerAfter.should.be.equal(owner);

      const pre = web3.eth.getBalance(investor);
      await this.crowdsale.claimRefund({ from: investor, gasPrice: 0 })
        .should.be.fulfilled;
      const post = web3.eth.getBalance(investor);
      post.minus(pre).should.be.bignumber.equal(lessThanGoal);
    });

    it('should forward funds to wallet after end if goal was reached', async function () {
      await increaseTimeTo(this.openingTime);
      await this.crowdsale.sendTransaction({ value: goal, from: investor });
      await increaseTimeTo(this.afterClosingTime);
      const pre = web3.eth.getBalance(wallet);
      await this.crowdsale.finalize({ from: owner });
      const post = web3.eth.getBalance(wallet);
      post.minus(pre).should.be.bignumber.equal(goal);
    });

    it('Testing ownership', async function () {
      await increaseTimeTo(this.openingTime);
      // To early to finalize.
      await this.crowdsale.finalize({from : owner }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.finalize({from : investor }).should.be.rejectedWith(EVMRevert);

      await increaseTimeTo(this.afterClosingTime);
      // Right time, but wrong dude.
      await this.crowdsale.finalize({from : investor }).should.be.rejectedWith(EVMRevert);

      // Right dude.
      await this.crowdsale.finalize({from : owner });

      // Only finalize once.
      await this.crowdsale.finalize({from : owner }).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.finalize({from : investor }).should.be.rejectedWith(EVMRevert);
    });
  });

});
