var web3;
var web3Provider;
// getting an intance of hosted contract
var accountInstance;
var bountyPostInstance;
var reviewInstance;

var url = (window.location.href).split("?");
var accountAddr;
var defaultAcc = '0x0000000000000000000000000000000000000000';

var accounts = [];

$(function () {
    $(window).load(function () {
        init();
    });
});

async function init() {
    try {
        await initWeb3();
        await initContract();
        accountAddr = web3.eth.defaultAccount;
        if (url.length > 1) {
            accountAddr = url[1];
        }
        console.log("accountAddr", accountAddr);
        showAccount(accountAddr);
        showAccountReviews(accountAddr);
        showAccountBounties(accountAddr);
    } catch (error) {

    }
}

async function initWeb3() {
    // Modern dapp browsers...;
    if (window.ethereum) {
        web3Provider = window.ethereum;
        try {
            // Request account access
            await window.ethereum.enable();
        } catch (error) {
            // User denied account access...
            console.error("User denied account access")
        }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
        web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
        web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(web3Provider);
}

async function initContract() {
    var BountyPostArtifact = await $.getJSON('BountyPost.json');

    var BountyPost = TruffleContract(BountyPostArtifact);

    // Set the provider for our contract
    BountyPost.setProvider(web3Provider);

    // Use our contract to retrieve and mark the adopted pets
    bountyPostInstance = await BountyPost.deployed();

    var AccountsArtifact = await $.getJSON('Accounts.json');
    // Get the necessary contract artifact file and instantiate it with truffle-contract
    // var AccountsArtifact = data;
    var Accounts = TruffleContract(AccountsArtifact);

    // Set the provider for our contract
    Accounts.setProvider(web3Provider);

    // Use our contract to retrieve and mark the adopted pets
    accountInstance = await Accounts.deployed();

    var ReviewArtifact = await $.getJSON('Reviews.json');
    // Get the necessary contract artifact file and instantiate it with truffle-contract

    var Review = TruffleContract(ReviewArtifact);

    // Set the provider for our contract
    Review.setProvider(web3Provider);

    // Use our contract to retrieve and mark the adopted pets
    reviewInstance = await Review.deployed();

}

async function showAccount(_accountAddr) {

    var accountDetails = await accountInstance.getAccount(_accountAddr);
    // var accountDetails = await accountInstance.getAccount(_accountAddr);
    if (accountDetails[0] === '0x00000000000000000000000000000000') {
        $("#AccountDetail").hide();
        $("#noAccount").show();
    }
    else {
        $("#firstname").text(web3.toAscii(accountDetails[0]));
        $("#lastname").text(web3.toAscii(accountDetails[1]));
        $("#bio").text(accountDetails[5]);
        $("#email").text(accountDetails[6]);
        $("#AccountDetail").show();
        $("#noAccount").hide();
    }

};

async function showAllAccounts() {
    accountInstance.getAccounts.call(function (err, allAccounts) {
        for (var i = 0; i < allAccounts.length; i++) {
            accountInstance.getAccount.call(allAccounts[i], function (err, accountDetails) {

                var accountObj = {
                    addr: accountDetails[4],
                    firstName: web3.toAscii(accountDetails[0]).replace(/\u0000/g, ''),
                    lastName: web3.toAscii(accountDetails[1]).replace(/\u0000/g, ''),
                    biography: accountDetails[5]
                };
                accounts.push(accountObj);

            });
        }
    })
};

function showAccountBounties(_accountAddr) {
    var _employerJobs = [];
    var workerJobs = [];
    var bountyCreatedRow = $('#bountyCreatedRow');
    var bountyAssignedRow = $('#bountyAssignedRow');
    var bountyTemplate = $('#bountyTemplate');
    try {
        // Get a list of all the bounties a user has created
        accountInstance.getEmployerJobs(_accountAddr).then(function (employerJobs) {
            for (i in employerJobs) {
                var jobId = employerJobs[i];
                bountyPostInstance.getBounty(jobId).then(function (result) {
                    bountyPostInstance.getWorker(result[0]).then(function (worker) {
                        bountyPostInstance.isComplete(result[0]).then(function (isCompleted) {

                            if (worker === defaultAcc && !isCompleted) {
                                status = "Open";
                            } else if (worker !== defaultAcc && !isCompleted) {
                                status = "In Progress";
                            } else {
                                status = "Closed";
                            }
                            var jobObj = {
                                id: result[0],
                                title: result[1],
                                description: result[2],
                                attachment: result[3],
                                payment: web3.fromWei(result[4].toNumber()),
                                status: status
                            };
                            var box = bountyTemplate.find('.box');
                            if (box) {
                                box.addClass("box-" + status);
                            }
                            bountyTemplate.find('.bounty-title').text(jobObj.title);
                            bountyTemplate.find('.bounty-dec').text(jobObj.description);
                            bountyTemplate.find('.bounty-payment').text(jobObj.payment);
                            bountyTemplate.find('.bounty-status').text(jobObj.status);
                            bountyCreatedRow.append(bountyTemplate.html());
                            _employerJobs.push(jobObj);
                            $("#NoBountyCreated").hide();
                            /*       var jobCard = document.getElementById('employerBountyCard' + result[0]);
                                  if (worker === defaultAcc && !isCompleted) {
                                      jobCard.className += " openJob";
                                  } else if (worker !== defaultAcc && !isCompleted) {
                                      jobCard.className += " inProgressJob";
                                  } else {
                                      jobCard.className += " closedJob";
                                  } */
                        });
                    });
                });
            }
        });
    } catch (error) {
        console.log("getEmployerJobs", error);
    }

    accountInstance.getAccount(_accountAddr).then(function (res) {
        console.log("getAccount", res);
    })
    try {
        // Get a list of all the jobs a user has been assigned to
        accountInstance.getWorkerJobs(_accountAddr).then(function (res) {
            for (var i = 0; i < res.length; i++) {
                bountyPostInstance.getBounty(res[i]).then(function (result) {
                    bountyPostInstance.getWorker(result[0]).then(function (worker) {
                        bountyPostInstance.isComplete(result[0]).then(function (isCompleted) {

                            if (worker === defaultAcc && !isCompleted) {
                                status = "Open";
                            } else if (worker !== defaultAcc && !isCompleted) {
                                status = "In Progress";
                            } else {
                                status = "Closed";
                            }
                            var jobObj = {
                                id: result[0],
                                title: result[1],
                                description: result[2],
                                attachment: result[3],
                                payment: web3.fromWei(result[4].toNumber()),
                                status: status
                            };
                            var box = bountyTemplate.find('.box');
                            if (box) {
                                box.addClass("box-" + status);
                            }
                            bountyTemplate.find('.bounty-title').text(jobObj.title);
                            bountyTemplate.find('.bounty-dec').text(jobObj.description);
                            bountyTemplate.find('.bounty-payment').text(jobObj.payment);
                            bountyTemplate.find('.bounty-status').text(jobObj.status);
                            bountyAssignedRow.append(bountyTemplate.html());
                            workerJobs.push(jobObj);
                            $("#NoBountyAssigned").hide();
                            /* var jobCard = document.getElementById('workerJobCard' + result[0]);
                            if (worker === defaultAcc && !isCompleted) {
                                jobCard.className += " openJob";
                            } else if (worker !== defaultAcc && !isCompleted) {
                                jobCard.className += " inProgressJob";
                            } else {
                                jobCard.className += " closedJob";
                            } */
                        });
                    });
                });
            }
        });
    } catch (error) {
        console.log("getWorkerJobs", error);
    }
};

async function showAccountReviews(_accountAddr) {
    try {
        var reviews = [];
        var reviewsRow = $('#reviewsRow');
        var reviewsTemplate = $('#reviewsTemplate');

        var reviews = await reviewInstance.getReceivedReviews(_accountAddr);
        if (reviews && reviews.length > -1) {
            $("#NoReceivedReviews").hide();
        }
        for (var i in reviews) {
            var review = await reviewInstance.getReview(reviews[i]);
            var reviewObj = {
                reviewee: review[0],
                bountyID: review[1],
                reviewText: review[2],
                stars: review[3],
                reviewID: review[4],
                reviewer: review[5]
            };
            reviewsTemplate.find('.reviewText').text(reviewObj.reviewText);
            reviewsTemplate.find('.stars').text(reviewObj.stars);
            var reviewerHtml = '<a href="./account.html?' + reviewObj.reviewer + '">' + reviewObj.reviewer + '</a>';
            reviewsTemplate.find('.reviewer').html(reviewerHtml);
            var bountyHtml = '<a href="./bounty.html?' + reviewObj.bountyID + '">See bounty</a>';
            reviewsTemplate.find('.seejob').html(bountyHtml);
            reviewsRow.append(reviewsTemplate.html());

            reviews.push(reviewObj);

        };

    } catch (error) {
        console.error("showAccountReviews", error);
    }
}

async function showJobReviews() {
    try { } catch (error) { }
}