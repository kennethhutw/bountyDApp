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
        }
      }
    }
    catch (error) {
      console.error("no accounts", error);
    }
    return App.initContract();
  },
  updateInterface: function () {
    //App.initWeb3();
    if (web3) {
      var accounts = web3.eth.accounts;
      if (accounts && accounts.length > 0) {
        $("#walletAddress").val(accounts[0]);
      }
    }
  },
  initContract: function () {
    /*
     * Replace me...
     */
    $.getJSON('Accounts.json', function (data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var AccountsArtifact = data;
      App.contracts.Accounts = TruffleContract(AccountsArtifact);

      // Set the provider for our contract
      App.contracts.Accounts.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets

    });
    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on('click', '#registerButton', App.handleRegister);
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
      if (result) {
        App.handleMsg(true, "success", `Thank you for registering`);
        window.location.href = "index.html";
      }
    }).catch(function (err) {
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
