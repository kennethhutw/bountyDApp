## Avoiding Common Attacks

Measures taken to avoid common attacks:

- Tested with %100 statement coverage ([coverage result from solidity-coverage](http://htmlpreview.github.io/?https://github.com/ferittuncer/consensys-dev-final/blob/master/src/ethereum/coverage/contracts/ProofOfExistence.sol.html))

- Wrote the contract as simply as possible to avoid bugs. There is no function which depends on Transaction Ordering and Timestamp Dependence. 

- There is no function that writes to blockchain, timestamp(), so the attack surface is tiny.

- There are no recursive calls and no external calls to avoid possible reentrancy issues.

- There is only an arithmetic operation for counting and they can't result with overflow/underflow (count returns new length and the minimum it can return is 0). 

- It will transfer bounty to Employer or freelancer when work is completed or canceled and this can't result with the Denial of Service with Failed Call and the Force Sending Ether. 

- Contract owner has no privilege to alter records or to use functions.Only bounty creator and worker can interact with smart contract. These smart contracts is trustless.