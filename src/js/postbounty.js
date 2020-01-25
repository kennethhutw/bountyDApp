App = {
    web3Provider: null,
    contracts: {},
    bounties: [],
    isLast: false,
    currentUser: null,
    web3: null,
    init: async function () {
        $("#msg").hide();
        const node = await window.Ipfs.create({ repo: String(Math.random() + Date.now()) })

        console.log('IPFS node is ready', node);

        async function saveToIpfs(file) {
            const reader = new FileReader();
            reader.onloadend = function () {

                const buf = buffer.Buffer(reader.result) // Convert data into buffer
                node.add(buf, (err, result) => { // Upload buffer to IPFS
                    if (err) {
                        console.error(err)
                        return
                    }
                    let url = `https://ipfs.io/ipfs/${result[0].hash}`;
                    document.getElementById("ipfsresult").innerHTML = '<a href="' + url + '"  target="_blank">' + url + '</a>';
                    document.getElementById("attachment").innerHTML = result[0].hash;

                })
            }
            reader.readAsArrayBuffer(file[0]);

        }
        function captureFile(event) {
            saveToIpfs(event.target.files);
        }
        document.getElementById('uploadtoIpfs').onchange = captureFile;

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
    initContract: function () {

        $.getJSON('BountyPost.json', function (data) {
            // Get the necessary contract artifact file and instantiate it with truffle-contract
            var BountyPostArtifact = data;
            App.contracts.BountyPost = TruffleContract(BountyPostArtifact);

            // Set the provider for our contract
            App.contracts.BountyPost.setProvider(App.web3Provider);
        });
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
        $(document).on('click', '#postBounty', App.addBounty);
    },
    updateInterface: function () {
        // App.initWeb3();
    },
    addBounty: function (event) {
        var _title = $("#title").val();
        var _desc = $("#description").val();
        var _attachment = $("#attachment").text();
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

                    App.handleMsg(true, "success", 'Added to EmployerJobs');
                    console.log('Added to EmployerJobs');
                }).catch(function (err) {
                    console.log(err.message);
                });
            }
        })
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
