App = {
  web3Provider: null,
  contracts: {},
  bounties: [],
  isLast: false,
  currentUser: null,
  isOwner: false,
  applicantAccepted: false,
  worker: "",
  web3: null,
  starRating: 1,
  workRating: 1,
  init: async function () {
    $("#msg").hide();
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
    App.web3 = new Web3(App.web3Provider);
    try {
      if (App.web3) {
        var accounts = App.web3.eth.accounts;
        if (accounts && accounts.length > 0) {
          $("#walletAddress").val(accounts[0]);
          $("#signup").hide();
          $("#login").hide();
          $("#user").show();
          let walletAddress = " " + accounts[0].substring(0, 5) +
            "...." +
            accounts[0].substring(accounts[0].length - 5, accounts[0].length);
          App.currentUser = accounts[0];
          $("#useraddress").text(walletAddress);
        }
      } else {
        $("#signup").show();
        $("#login").show();
        $("#user").hide();
      }
    }
    catch (error) {
      console.error("no accounts", error);
    }
    return App.initContract();
  },
  updateInterface: function () {
    App.initButtons();

  },

  initContract: function () {

    $.getJSON('BountyPost.json', function (data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var BountyPostArtifact = data;
      App.contracts.BountyPost = TruffleContract(BountyPostArtifact);

      // Set the provider for our contract
      App.contracts.BountyPost.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets
      App.initBountries();
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
    $(document).on('click', '#postBounty', App.addBounty);
    $(document).on('click', '.btn-apply', App.applyToBounty);
    $(document).on('click', '.btn-accept', App.acceptApplicant);
    $(document).on('click', '#completeJobButton', App.completeBounty);
    $(document).on('click', '#cancelJobButton', App.cancelBounty);
    $(document).on('click', '#completeWorkButton', App.completeWork);
    $(document).on('click', '#cancelBountyButton', App.cancelBounty);

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
    var reviews = await ReviewPostInstance.getReceivedReviews(bounty[5]);
    if (reviews && reviews.length > 0) {
      for (var rev in reviews) {
        var review = await ReviewPostInstance.getReview(rev);
        var reviewObj = {
          reviewee: review[0],
          bountyID: review[1],
          reviewText: review[2],
          stars: review[3],
          reviewID: review[4],
          reviewer: review[5]
        };
        receivedReviewsTemplate.find('.reviewText').text(reviewObj.reviewText);
        receivedReviewsTemplate.find('.stars').text(reviewObj.stars);
        let walletAddress = " " + reviewObj.reviewer.substring(0, 10) +
          "...." +
          reviewObj.reviewer.substring(reviewObj.reviewer.length - 10, reviewObj.reviewer.length);
        var reviewerHtml = '<a id="reviewer" href="./account.html?' + reviewObj.reviewer +
          '" title="' + reviewObj.reviewer + '">' + walletAddress + '</a>';
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
    var bountyId = parseInt(url[1]);
    var employerReview = [];
    var workerReview = [];
    var isCompleted = false;

    var bountyPostInstance = await App.contracts.BountyPost.deployed();
    isCompleted = await bountyPostInstance.isComplete(bountyId);
    var ReviewPostInstance = await App.contracts.Review.deployed();
    var reviews = await ReviewPostInstance.getJobReviews(bountyId);
    if (reviews && reviews.length > -1) {
      for (var rev in reviews) {
        var review = await ReviewPostInstance.getReview(reviews[rev]);
        var worker = await bountyPostInstance.getWorker(bountyId);
        if (review[0] === worker) {
          var reviewObj = {
            reviewee: review[0],
            bountyID: review[1],
            reviewText: review[2],
            stars: review[3],
            reviewID: review[4],
            reviewer: review[5],
          };
          employerReview.push(reviewObj);
        } else {
          var reviewObj = {
            reviewee: review[0],
            bountyID: review[1],
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
    var bountyPostInstance = await App.contracts.BountyPost.deployed();
    var accountInstance = await App.contracts.Accounts.deployed();
    var defaultAcc = '0x0000000000000000000000000000000000000000';
    var _worker;
    var bountyRow = $('#bountyRow');
    bountyRow.html("");
    var bountyTemplate = $('#bountyTemplate');
    var url = (window.location.href).split("?");
    var _bountyId = url[1];
    if (_bountyId == null) {
      _bountyId = 0;
      App.isStart = true;
    } else {
      _bountyId = parseInt(_bountyId);
    }

    var _bounty = await bountyPostInstance.getBounty(_bountyId);
    var _isComplete = await bountyPostInstance.isComplete(_bounty[0]);
    var _worker = await bountyPostInstance.getWorker(_bounty[0]);

    App.worker = _worker;
    if (_worker === defaultAcc && !_isComplete) {
      status = "Open";
    } else if (_worker !== defaultAcc && !_isComplete) {
      status = "In Progress";
    } else {
      status = "Closed";
    }
    var bountyObj = {
      id: _bounty[0],
      title: _bounty[1],
      description: _bounty[2],
      attachment: _bounty[3],
      payment: web3.fromWei(_bounty[4].toNumber()),
      status: status
    };
    bountyTemplate.find('.panel-title').text(bountyObj.title);
    bountyTemplate.find('.bounty-id').text(bountyObj.id);
    bountyTemplate.find('.bounty-title').text(bountyObj.title);
    bountyTemplate.find('.bounty-dec').text(bountyObj.description);
    bountyTemplate.find('.bounty-payment').text(bountyObj.payment);
    if (bountyObj.attachment) {
      let url = `https://ipfs.io/ipfs/${bountyObj.attachment}`;
      let innerHTML = '<a href="' + url + '"  target="_blank">' + url + '</a>';

      bountyTemplate.find('.bounty-attachment').html(innerHTML);
    }
    bountyTemplate.find('.bounty-status').text(bountyObj.status);
    bountyTemplate.find('.btn-detail').attr("data-id", bountyObj.id);
    bountyRow.append(bountyTemplate.html());
    App.bounties.push(bountyObj);

    return App.initEmployer();
  },
  initEmployer: async function () {
    var bountyPostInstance = await App.contracts.BountyPost.deployed();
    var accountInstance = await App.contracts.Accounts.deployed();
    var employerInfo = {};
    var url = (window.location.href).split("?");
    var _bountyId = parseInt(url[1]);

    var result = await bountyPostInstance.getBounty(_bountyId);
    var owner = await accountInstance.getAccount(result[5]);
    employerInfo = {
      addr: result[5],
      bio: owner[5],
      firstname: web3.toAscii(owner[0]),
      lastname: web3.toAscii(owner[1])
    }
    //  var name = web3.toAscii(owner[0])+" "+web3.toAscii(owner[1]);
    $("#name").text(employerInfo.firstname + " " + employerInfo.lastname);
    $("#bio").text(employerInfo.bio);
    //$("#employerAddr").text(employerInfo.addr);
    var emplyerPageLink = ' <a href="./account.html?' + employerInfo.addr + '">Go to employers page</a>'
    $("#employerPage").html(emplyerPageLink);
    if (App.currentUser == employerInfo.addr) {
      $("#showApplicants").show();
      App.showApplicants();
    } else {
      $("#showApplicants").hide();
    }
    App.initButtons();
    return App.showReceivedReviews();
  },
  checkOwner: async function () {
    var bountyPostInstance = await App.contracts.BountyPost.deployed();
    isOwner = false;
    var url = (window.location.href).split("?");
    var bountyId = parseInt(url[1]);

    var accounts = App.web3.eth.accounts;
    var bounty = await bountyPostInstance.getBounty(bountyId);
    App.isOwner = (bounty[5] === accounts[0])
  },
  initButtons: async function () {
    // applicantAccepted
    App.checkOwner();
    var isWorker = false;
    var bountyPostInstance = await App.contracts.BountyPost.deployed();
    var url = (window.location.href).split("?");
    var _bountyId = parseInt(url[1]);
    var _accounts = App.web3.eth.accounts;
    var _currentUser = await accountInstance.getAccount(_accounts[0]);
    if (_currentUser[0] == "0x00000000000000000000000000000000") {
      $("#applyButton").hide();
      $("#cancelBountyButton").hide();
      return;
    }
    var worker = await bountyPostInstance.getWorker(_bountyId);
    var _bounty = await bountyPostInstance.getBounty(_bountyId);
    var _isWorkComplete = await bountyPostInstance.isWorkComplete(_bountyId);
    if (worker !== '0x0000000000000000000000000000000000000000') {
      App.applicantAccepted = true;
    }
    if (_accounts) {
      if (worker === _accounts[0]) {
        isWorker = true;
      }
    }
    if (App.applicantAccepted) {
      $("#applicantAccepted").html("");
      var accpetdworkerhtml = '<h5>Accepted Worker: <a href="./account.html?' + App.worker + '">' + App.worker + '</a> </h5>';
      $("#applicantAccepted").append(accpetdworkerhtml);
      $("#applyButton").hide();
      $("#showApplicants").hide();
    }
    else {

      $("#applyButton").show();
    }
    // isOwner
    if (App.isOwner) {
      $("#applyButton").hide();
      $("#cancelBountyButton").show();
    } else {
      $("#cancelBountyButton").hide();
      $("#showApplicants").hide();
    }
    // isWorker
    if (isWorker && _isWorkComplete) {
      $("#confirmWorkButton").hide();
    } else if (isWorker) {
      $("#confirmWorkButton").show();
    } else {
      $("#confirmWorkButton").hide();
    }
    //  applicantAccepted && isOwner
    if (App.applicantAccepted && App.isOwner) {
      $("#completeModalButton").show();
    } else {
      $("#completeModalButton").hide();
    }
    var status = document.getElementsByClassName('bounty-status');

    //  var status = bountyTemplate.find('.bounty-status').text();
    if (status[0].innerText == "Closed") {
      $("#completeModalButton").hide();
      $("#confirmWorkButton").hide();
      $("#cancelBountyButton").hide();
      //confirmWorkButton
    }
  },
  addBounty: function (event) {
    var _title = $("#title").val();
    var _desc = $("#description").val();
    var _attachment = $("#attachment").val();
    var _pay = $("#pay").val();
    var _amount = parseFloat(web3.toWei(_pay, 'ether'));

    var emptyAddr = '0x00000000000000000000000000000000';
    web3.eth.getBalance(web3.eth.accounts[0], function (err, balance) {
      if (web3.fromWei(balance) < _pay) {
        alert("You have insufficient funds to post this bounty.");
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
        }).then(function (bountyCount) {
          return accountsInstance.addEmployerJob(web3.eth.defaultAccount, bountyCount)
        }).then(function (result) {
          return bountyPostInstance.addBounty(_title, _desc, _attachment, _amount, {
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
  showApplicants: async function () {
    var bountyPostInstance = await App.contracts.BountyPost.deployed();
    var employerInfo = {};
    var url = (window.location.href).split("?");
    var _bountyId = parseInt(url[1]);

    var applicationRow = $('#applicationRow');
    var applicationTemplate = $('#applicationTemplate');


    var applicants = await bountyPostInstance.getApplicants(_bountyId);
    var worker = await bountyPostInstance.getWorker(_bountyId);
    var isUnique = true;
    for (var i = 0; i < applicants.length; i++) {
      if (applicants[i] === App.web3.eth.defaultAccount) {
        alert('You can only apply to a bounty once!');
        isUnique = false;
      }
      if (worker != applicants[i]) {
        var applicationHtml = '<h5><a href="./account.html?' + applicants[i] + '">' + applicants[i] + '</a></h5>';
        applicationTemplate.find('.applicant-account').html(applicationHtml);
        applicationTemplate.find('.btn-accept').attr("data-id", i);
        applicationRow.append(applicationTemplate.html());
      }
    }
    /*   if (isUnique) {
        var result = await jobPostInstance.applyToJob(_bountyId);
        if (!result)
          console.log(err);
        else {
          document.getElementById('applyButton').disabled = true;
          alert("Successfully applied to the job!");
        }
      } */
  },
  displayBountries: function (pageId) {

  },
  completeRating: function (value) {
    App.starRating = value;
    document.getElementById("completeStarRating").innerHTML = value;
  },
  workRating: function (value) {
    App.workRating = value;
    document.getElementById("workStarRating").innerHTML = value;
  },
  completeWork: async function (event) {

    var bountyPostInstance = await App.contracts.BountyPost.deployed();

    var url = (window.location.href).split("?");
    var bountyId = parseInt(url[1]);
    var reviewText = document.getElementById('workReviewTextInput').value;
    var stars = document.getElementById('workStarRating').innerHTML;

    var isWorkComplete = await bountyPostInstance.isWorkComplete(bountyId);
    if (!isWorkComplete) {
      if (confirm("Are you sure you want to confirm your work is complete?")) {
        var success = await bountyPostInstance.completeWork(bountyId);
        if (success) {
          var reviewee = await bountyPostInstance.getOwner(bountyId);
          App.postReview(reviewee, bountyId, reviewText, stars);
          $("#completeWorkModal").modal("hide");
          $("#confirmWorkButton").hide();
        } else {
          console.log("Failed to post bounty completion");
        }
      }
    }
  },
  postReview: async function (reviewee, bountyId, reviewText, stars) {
    try {
      var reviewInstance = await App.contracts.Review.deployed();
      stars = parseInt(stars);
      console.log(reviewee);
      console.log(bountyId);
      console.log(reviewText);
      console.log(stars);
      var res = await reviewInstance.postReview(reviewee, bountyId, reviewText, stars);

      console.log("Review post success");
    } catch (error) {
      console.log("Review post failure");
    }
  },
  applyToBounty: async function (event) {
    var emptyAddr = '0x00000000000000000000000000000000';
    var accountInstance = await App.contracts.Accounts.deployed();
    var bountyPostInstance = await App.contracts.BountyPost.deployed();
    var _id = event.target.dataset["id"];
    //window.location.href = "bounty.html?" + _id;
    var accountInfo = await accountInstance.getAccount(App.web3.eth.defaultAccount);
    // check if the account is registered
    if (accountInfo[0] !== emptyAddr) {
      var url = (window.location.href).split("?");
      var bountyId = parseInt(url[1]);
      var bounty = await bountyPostInstance.getBounty(bountyId);
      if (bounty[4] !== App.web3.eth.defaultAccount) {
        var applicants = await bountyPostInstance.getApplicants(bountyId);
        var isUnique = true;
        for (var i = 0; i < applicants.length; i++) {
          if (applicants[i] === App.web3.eth.defaultAccount) {
            alert('You can only apply to a bounty once!');
            isUnique = false;
          }
        }
        if (isUnique) {
          var result = await bountyPostInstance.applyToBounty(bountyId);

          document.getElementById('applyButton').disabled = true;
          alert("Successfully applied to the bounty!");

        };
      } else {
        alert('You cannot apply to your own bounty!');
      }
    } else {
      alert('This account is not registered!');
    }

  },
  acceptApplicant: async function (event) {
    event.preventDefault();
    var url = (window.location.href).split("?");
    var bountyId = parseInt(url[1]);

    var index = parseInt($(event.target).data('id'));
    var accountInstance = await App.contracts.Accounts.deployed();
    var bountyPostInstance = await App.contracts.BountyPost.deployed();

    var applicants = await bountyPostInstance.getApplicants(bountyId);
    if (confirm('Are you sure you want to accept this Applicant?')) {
      var isSuccess = await bountyPostInstance.setWorker(bountyId, applicants[index]);
      if (isSuccess) {
        var result = await accountInstance.addWorkerJob(applicants[index], bountyId);
      }
    }

  },
  cancelBounty: async function (event) {
    var bountyPostInstance = await App.contracts.BountyPost.deployed();

    var url = (window.location.href).split('?');
    var bountyId = parseInt(url[1]);
    var isCompleted = await bountyPostInstance.isComplete(bountyId);
    if (isCompleted) {
      alert('Bounty is already completed!');
    } else {
      if (confirm('Are you sure you want to cancel this Bounty?')) {
        var success = await bountyPostInstance.cancelBounty(bountyId);
        if (success) {
          // Disable buttons
          document.getElementById('completeJobButton').disabled = true;
          document.getElementById('cancelJobButton').disabled = true;
          document.getElementById('applyButton').disabled = true;
        }
      }
    }
  },
  completeBounty: async function (event) {
    var bountyPostInstance = await App.contracts.BountyPost.deployed();

    var url = (window.location.href).split("?");
    var bountyId = parseInt(url[1]);

    var reviewText = document.getElementById('completeReviewTextInput').value;
    var stars = document.getElementById('completeStarRating').innerHTML;

    var isCompleted = await bountyPostInstance.isComplete(bountyId);
    var isWorkComplete = await bountyPostInstance.isWorkComplete(bountyId);
    var reviewee = await bountyPostInstance.getWorker(bountyId);
    if (isCompleted) {
      alert('Bounty is already complete');
    } else if (!isWorkComplete) {
      alert('Worker has not marked the work as complete');
    } else {
      if (confirm('Are you sure you want to complete this Bounty?')) {
        var result = await bountyPostInstance.completeBounty(bountyId);
        App.postReview(reviewee, bountyId, reviewText, stars);
        // Disable buttons.
        document.getElementById('completeModalButton').disabled = true;
        document.getElementById('completeJobButton').disabled = true;
        document.getElementById('cancelBountyButton').disabled = true;
        // Close modal.
        $("#completeJobModal").modal("hide");
      }
    }
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
