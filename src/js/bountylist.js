App = {
    web3Provider: null,
    contracts: {},
    bounties: [],
    isLast: false,
    init: async function () {
        $("#msg").hide();
        var url = (window.location.href).split("?");
        console.log("url", url);
        return await App.initWeb3();
    },

    initWeb3: async function () {
        // Modern dapp browsers...
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
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
            App.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(App.web3Provider);
        return App.initContract();
    },

    initContract: function () {

        $.getJSON('BountyPost.json', function (data) {
            // Get the necessary contract artifact file and instantiate it with truffle-contract
            var BountyPostArtifact = data;
            App.contracts.BountyPost = TruffleContract(BountyPostArtifact);

            // Set the provider for our contract
            App.contracts.BountyPost.setProvider(App.web3Provider);

            // Use our contract to retrieve and mark the adopted pets
            App.initBountries(0);
        });
        $.getJSON('Accounts.json', function (data) {
            // Get the necessary contract artifact file and instantiate it with truffle-contract
            var AccountsArtifact = data;
            App.contracts.Accounts = TruffleContract(AccountsArtifact);

            // Set the provider for our contract
            App.contracts.Accounts.setProvider(App.web3Provider);

            // Use our contract to retrieve and mark the adopted pets

        });
        $.getJSON('Reviews.json', function (data) {
            // Get the necessary contract artifact file and instantiate it with truffle-contract
            var ReviewArtifact = data;
            App.contracts.Review = TruffleContract(ReviewArtifact);

            // Set the provider for our contract
            App.contracts.Review.setProvider(App.web3Provider);

            // Use our contract to retrieve and mark the adopted pets

        });
        return App.bindEvents();
    },

    bindEvents: function () {
        $(document).on('click', '#postBounty', App.addJob);
        $(document).on('click', '.btn-detail', App.handleDetail);
    },
    addJob: function (event) {
        var _title = $("#title").val();
        var _desc = $("#description").val();
        var _pay = $("#pay").val();
        var _amount = parseFloat(web3.toWei(_pay, 'ether'));
        var _accountInfo;

        var emptyAddr = '0x00000000000000000000000000000000';
        web3.eth.getBalance(web3.eth.accounts[0], function (err, balance) {
            if (web3.fromWei(balance) < _pay) {
                alert("You have insufficient funds to post this job.");
            } else {
                var accountsInstance;
                var bountyPostInstance;
                App.contracts.Accounts.deployed().then(function (instance) {
                    accountsInstance = instance;
                    return App.contracts.BountyPost.deployed();
                }).then(function (instance) {
                    bountyPostInstance = instance;
                    return accountsInstance.getAccount(web3.eth.defaultAccount);
                }).then(function (accountInfo) {
                    _accountInfo = accountInfo;
                    return bountyPostInstance.getBountyCount();
                }).then(function (jobCount) {
                    return accountsInstance.addEmployerJob(web3.eth.defaultAccount, jobCount)
                }).then(function (result) {
                    return bountyPostInstance.addBounty(_title, _desc, _amount, {
                        from: web3.eth.defaultAccount,
                        value: _amount
                    });
                }).then(function (result) {
                    console.log('Added to EmployerJobs');
                }).catch(function (err) {
                    console.log(err.message);
                });
            }
        })
    },
    showReceivedReviews: async function () {
        var receivedReviews = [];
        var url = (window.location.href).split("?");
        var bountyId = parseInt(url[1]);

        var bountyPostInstance = await App.contracts.BountyPost.deployed();
        var bounty = await bountyPostInstance.getBounty(bountyId);

        var receivedReviewsRow = $('#receivedReviewsRow');
        var receivedReviewsTemplate = $('#receivedReviewsTemplate');

        var ReviewPostInstance = await App.contracts.Review.deployed();
        var reviews = await ReviewPostInstance.getReceivedReviews(bounty[4]);
        if (reviews && reviews.length > 0) {
            for (var rev in reviews) {
                var review = await reviewInstance.getReview(rev);
                var reviewObj = {
                    reviewee: review[0],
                    jobID: review[1],
                    reviewText: review[2],
                    stars: review[3],
                    reviewID: review[4],
                    reviewer: review[5]
                };
                receivedReviewsTemplate.find('.reviewText').text(reviewObj.title);
                receivedReviewsTemplate.find('.stars').text(reviewObj.id);
                var reviewerHtml = '<a href="./account.html?' + reviewObj.reviewer + '">' + reviewObj.reviewer + '</a>';
                receivedReviewsTemplate.find('.reviewer').html(reviewerHtml);
                receivedReviewsRow.append(receivedReviewsTemplate.html());
                receivedReviews.push(reviewObj);
            }
        }
        if (receivedReviews.length > 0) {
            $("#NoReceivedReviews").hide();
        }
    },
    initReview: async function () {
        var url = (window.location.href).split("?");
        var jobId = parseInt(url[1]);
        var employerReview = [];
        var workerReview = [];
        var isCompleted = false;

        var bountyPostInstance = await App.contracts.BountyPost.deployed();
        isCompleted = await bountyPostInstance.isComplete(jobId);


        var ReviewPostInstance = await App.contracts.Review.deployed();
        reviews = await ReviewPostInstance.getJobReviews(jobId).deployed();
        if (reviews && reviews.length > -1) {
            for (var rev in reviews) {
                var review = await reviewInstance.getReview(reviews[rev]);
                var worker = await bountyPostInstance.getWorker(jobId);
                if (review[0] === worker) {
                    var reviewObj = {
                        reviewee: review[0],
                        jobID: review[1],
                        reviewText: review[2],
                        stars: review[3],
                        reviewID: review[4],
                        reviewer: review[5],
                    };
                    employerReview.push(reviewObj);
                } else {
                    var reviewObj = {
                        reviewee: review[0],
                        jobID: review[1],
                        reviewText: review[2],
                        stars: review[3],
                        reviewID: review[4],
                        reviewer: review[5],
                        isCompleted: isCompleted
                    };
                    workerReview.push(reviewObj);
                }
            }
            if (employerReview.length == 0) {

            }
            /*    if() */
        }
        else {

        }

    },
    initBountries: async function () {
        var bountyPostInstance;
        var defaultAcc = '0x0000000000000000000000000000000000000000';
        var _worker;
        var bountyRow = $('#bountyRow');
        var bountyTemplate = $('#bountyTemplate');
        var url = (window.location.href).split("?");
        var _pageId = url[1];
        if (_pageId == null || _pageId <= 1) {
            _pageId = 1;
            App.isStart = true;
        } else {
            _pageId = parseInt(_pageId);
        }

        var pageDisplayNum = _pageId * 10;
        var pageDisplayStart = pageDisplayNum - 10;

        var bountyPostInstance = await App.contracts.BountyPost.deployed();
        var count = await bountyPostInstance.getBountyCount();
        if (pageDisplayNum >= count) {
            pageDisplayNum = count;
            App.isLast = true;
        }
        for (var i = pageDisplayStart; i < pageDisplayNum; i++) {
            var _result = await bountyPostInstance.getBounty(i);
            var _isComplete = await bountyPostInstance.isComplete(_result[0]);
            var _worker = await bountyPostInstance.getWorker(_result[0]);
            if (_worker === defaultAcc && !_isComplete) {
                status = "Open";
            } else if (_worker !== defaultAcc && !_isComplete) {
                status = "In Progress";
            } else {
                status = "Closed";
            }
            var bountyObj = {
                id: _result[0],
                title: _result[1],
                description: _result[2],
                attachment: _result[3],
                payment: web3.fromWei(_result[4].toNumber()),
                status: status
            };
            bountyTemplate.find('.panel-title').text(bountyObj.title);
            bountyTemplate.find('.bounty-id').text(bountyObj.id);
            bountyTemplate.find('.bounty-title').text(bountyObj.title);
            bountyTemplate.find('.bounty-dec').text(bountyObj.description);
            bountyTemplate.find('.bounty-payment').text(bountyObj.payment);
            bountyTemplate.find('.bounty-status').text(bountyObj.status);
            bountyTemplate.find('.btn-detail').attr("data-id", bountyObj.id);
            bountyRow.append(bountyTemplate.html());
            App.bounties.push(bountyObj);
        }
        if (App.bounties.length > 0) {
            $("#noBounties").hide();
        }
        console.log("App.jobs", App.bounties);
    },
    handleDetail: function (event) {
        var _id = event.target.dataset["id"];
        window.location.href = "bounty.html?" + _id;
    },
    handleMsg: function (IsShow, type, message) {
        if (!IsShow) {
            $("#msg").hide().removeClass("alert-success").removeClass("alert-danger");
            $("#msgContent").text('');

        } else {
            $("#msg").show();
            if (type == "success") {
                $("#msg").addClass("alert-success");
            }
            else {
                $("#msg").addClass("alert-danger");
            }
            $("#msgContent").text(message);
        }
    }

};

$(function () {
    $(window).load(function () {
        App.init();
    });
});
