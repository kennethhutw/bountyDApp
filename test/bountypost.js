var BountyPost = artifacts.require("./BountyPost.sol");

var title = "Bounty Test";
var description = "Description Test. This is a Test";
var payment = "1";
var attachment = 'QmZs6nJCo54uwTKNhnHyf3DxQBKbWwAHWyeyov5B1jftbw';

contract('BountyPost', function (accounts) {
    it("Should post a bounty and retrieve successfully", function () {
        return BountyPost.deployed().then(function (instance) {
            deployedBounty = instance;
            var amount = web3.utils.toWei(payment, 'ether');
            return deployedBounty.addBounty(title, description, attachment, amount, { from: accounts[0], value: amount });
        }).then(function (Bounty) {
            return deployedBounty.getBounty.call(0);
        }).then(function (retrievedBounty) {

            assert.equal(retrievedBounty[0], 0, "Id returned incorrect");
            assert.equal(retrievedBounty[1], title, "Title returned incorrect");
            assert.equal(retrievedBounty[2], description, "Description returned incorrect");
            assert.equal(retrievedBounty[3], attachment, "Attachment returned incorrect");
            assert.equal(web3.utils.fromWei(retrievedBounty[4]), payment, "Payment returned incorrect");
        })
    });

    it("Should return the correct count of posted bounties", function () {
        return BountyPost.deployed().then(function (instance) {
            deployedBounty = instance;
            return (deployedBounty.getBountyCount.call());
        }).then(function (bountyCount) {
            assert.equal(bountyCount.toNumber(), 1, "Incorrect bounty count returned before bounty added");
            var amount = web3.utils.toWei(payment, 'ether');
            return deployedBounty.addBounty(title, description, attachment, amount, { from: accounts[0], value: amount });
        }).then(function (bountyTrans) {
            return (deployedBounty.getBountyCount.call());
        }).then(function (bountyCount) {
            assert.equal(bountyCount, 2, "Incorrect bounty count after new bounty added");
        })
    });

    it("Should allocate a worker correctly", function () {
        return BountyPost.deployed().then(function (instance) {
            deployedBounty = instance;
            return deployedBounty.setWorker(0, accounts[1], { from: accounts[0] })
        }).then(function (workerTrans) {
            return deployedBounty.getWorker.call(0);
        }).then(function (worker) {
            assert.equal(worker, accounts[1], "Incorrect worker address");
        })
    });

    it("Should apply users to a bounty", function () {
        return BountyPost.deployed().then(function (instance) {
            deployedBounty = instance;
            deployedBounty.applyToBounty(0, { from: accounts[1] });
            deployedBounty.applyToBounty(1, { from: accounts[2] });
            return deployedBounty.applyToBounty(0, { from: accounts[2] })
        }).then(function (applicationTrans) {
            return deployedBounty.getApplicants(0);
        }).then(function (applicants) {
            assert.equal(applicants[0], accounts[1], "Wrong first applicant");
            assert.equal(applicants[1], accounts[2], "Wrong second applicant");
        })
    });

    var beforeBountyBalance;
    it("Should complete a bounty & pay a worker", function () {
        return BountyPost.deployed().then(function (instance) {
            deployedBounty = instance;
            return deployedBounty.isComplete.call(0);
        }).then(function (isCompleted) {
            assert.equal(isCompleted, false, "bounty is complete before calling isComplete");
            return web3.eth.getBalance(accounts[1]);
        }).then(function (workerBalance) {
            beforeBountyBalance = workerBalance;
            return deployedBounty.completeBounty(0, { from: accounts[0] });
        }).then(function (completeTrans) {
            return deployedBounty.isComplete.call(0);
        }).then(function (isCompleted) {
            assert.equal(isCompleted, true, "bounty is not complete after calling isComplete");
            return web3.eth.getBalance(accounts[1]);
        }).then(function (workerBalance) {
            assert.equal(workerBalance, (parseInt(beforeBountyBalance) + parseInt(web3.utils.toWei(payment))), "worker balance has not been increased correctly after isComplete");
        })
    });

    it("Should cancel a bounty and return payment funds to the owner", function () {
        return BountyPost.deployed().then(function (instance) {
            deployedBounty = instance;
            return web3.eth.getBalance(accounts[0]);
        }).then(function (ownerBalance) {
            beforeBountyBalance = ownerBalance;
            return deployedBounty.cancelBounty(1, { from: accounts[0] })
        }).then(function (cancelTrans) {
            return web3.eth.getBalance(accounts[0]);
        }).then(function (workerBalance) {
            assert(workerBalance > (parseInt(beforeBountyBalance)));
        })
    })
});
