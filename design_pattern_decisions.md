# Design Pattern Decisions

The BountyDapp project is designed that I decided not use any design pattern. This is because these smart contracts is trustless and independent so I did not apply Ownable smart contract.  Only bounty creator, worker and arbitrator can interact with a bounty. 

The BountyPost contract would hold all the ether deposited by bounty creator and be responsible for payouts. In this smart contract, the bounty rewards only can transfer to worker or bounty creator. This would be more secure. So I did not apply any payment pattern. 

In this dapp, It does not need to do calculate.  There is only an arithmetic operation for counting and they can't result with overflow/underflow so decide not use SafeMath.

