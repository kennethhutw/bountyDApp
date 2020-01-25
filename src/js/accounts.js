App = {
  web3Provider: null,
  contracts: {},

  init: async function () {
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
    try {
      if (web3) {
        var accounts = web3.eth.accounts;
        if (accounts && accounts.length > 0) {
          $("#walletAddress").val(accounts[0]);
          $("#signup").hide();
          $("#login").hide();
          $("#user").show();
          let walletAddress = " " + accounts[0].substring(0, 5) +
            "...." +
            accounts[0].substring(accounts[0].length - 5, accounts[0].length);
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

  initContract: function () {

    $.getJSON('Accounts.json', function (data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var AccountsArtifact = data;
      App.contracts.Accounts = TruffleContract(AccountsArtifact);

      // Set the provider for our contract
      App.contracts.Accounts.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets
      return App.displayAccounts();
    });
    return App.bindEvents();
  },
  displayAccounts: function () {
    var accountsRow = $('#AccountsRow');
    var accountTemplate = $('#AccountTemplate');
    var accountsInstance;

    App.contracts.Accounts.deployed().then(function (instance) {
      accountsInstance = instance;

      // Execute adopt as a transaction by sending account
      return accountsInstance.getAccounts();
    }).then(function (allAccounts) {
      if (allAccounts.length > 0) {
        $("#noFreelancers").hide();
      }
      for (i = 0; i < allAccounts.length; i++) {
        accountsInstance.getAccount(allAccounts[i]).then(function (accountDetails) {

          var name = web3.toAscii(accountDetails[1]).replace(/\u0000/g, '') +
            " " + web3.toAscii(accountDetails[0]).replace(/\u0000/g, '');
          accountTemplate.find('.panel-title').text(name);
          accountTemplate.find('.account-walletaddress').text(accountDetails[4]);
          accountTemplate.find('.account-biography').text(accountDetails[5]);
          accountTemplate.find('.account-name').text(name);
          accountTemplate.find('.account-email').text(accountDetails[6]);
          accountTemplate.find('.btn-detail').attr("data-address", accountDetails[4]);
          accountsRow.append(accountTemplate.html());
        });

      }

    }).catch(function (err) {
      console.log(err.message);
    });
  },
  bindEvents: function () {
    $(document).on('click', '#registerButton', App.handleRegister);
    // btn-detail
    $(document).on('click', '.btn-detail', App.handleDetail);
  },
  handleDetail: function (event) {
    var _address = event.target.dataset["address"];
    window.location.href = "account.html?" + _address;
  },
  handleRegister: function (event) {
    event.preventDefault();
    App.handleMsg(false, "", "");

    var accountsInstance;

    var account = $("#walletAddress").val();

    App.contracts.Accounts.deployed().then(function (instance) {
      accountsInstance = instance;

      // Execute adopt as a transaction by sending account
      return accountsInstance.getAccount(account, { from: account });
    }).then(function (accountInfo) {

      if (accountInfo[0] === '0x00000000000000000000000000000000') {
        var firstname = $("#firstnameInput").val();
        var surname = $("#surnameInput").val();
        var email = $("#emailInput").val();
        var biography = $("#biographyInput").val();
        return accountsInstance.setAccount(account,
          firstname,
          surname, biography, email, { from: account });
      } else {
        console.log(`${account} already exists`);
        App.handleMsg(true, "danger", `${account} already exists`);
        return;
      }
    }).then(function (result) {
      console.log(result);
      if (result) {

        App.handleMsg(true, "success", `Thank you for registering`);
        window.location.href = "index.html";
      }
    })
      .catch(function (err) {
        App.handleMsg(true, "danger", err.message);
        console.log(err.message);
      });

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
