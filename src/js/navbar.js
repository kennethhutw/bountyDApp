var web3;
var web3Provider = null;
var accountInstance;

async function initWeb3() {

    // Modern dapp browsers...
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
        //web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }

    if (!web3Provider)
        return;
    web3 = new Web3(web3Provider);

    web3.currentProvider.publicConfigStore.on('update', initAccount);

    var AccountsArtifact = await $.getJSON('Accounts.json');
    // Get the necessary contract artifact file and instantiate it with truffle-contract

    var Accounts = TruffleContract(AccountsArtifact);

    // Set the provider for our contract
    Accounts.setProvider(web3Provider);

    // Use our contract to retrieve and mark the adopted pets
    accountInstance = await Accounts.deployed();

    initAccount();


}

initWeb3();

// Listening for Selected Account Changes
// From https://github.com/MetaMask/faq/blob/master/DEVELOPERS.md

/* var account = web3.eth.accounts;
var accountInterval = setInterval(function () {
    if (web3.eth.accounts[0] !== account) {
        account = web3.eth.accounts[0];
        // updateInterface();
    }
}, 100); */



// Display current Ethereum network.
// From https://github.com/MetaMask/faq/blob/master/DEVELOPERS.md

web3.version.getNetwork((err, netId) => {
    switch (netId) {
        case "1":
            document.getElementById("network").innerHTML = 'Network: Mainnet';
            break
        case "2":
            document.getElementById("network").innerHTML = 'Network: Deprecated Morden test network.'
            break
        case "3":
            document.getElementById("network").innerHTML = 'Network: Ropsten test network.';
            break
        case "4":
            document.getElementById("network").innerHTML = 'Network: Rinkeby test network.';
            break
        case "42":
            document.getElementById("network").innerHTML = 'Network: Kovan test network.';
            break
        default:
            document.getElementById("network").innerHTML = 'Network: Unknown/test network.';
    }
})

function charCount(n) {
    var total = n.value.length;
    document.getElementById("char-count").innerHTML = total + "/500";
}

async function login() {
    // Modern dapp browsers...
    if (window.ethereum) {
        web3Provider = window.ethereum;
        try {
            // Request account access
            await window.ethereum.enable();
        } catch (error) {
            // User denied account access...
            console.error("User denied account access");
            alert("User denied account access");
        }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
        web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
        //web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }

    if (!web3Provider)
        return;
    web3 = new Web3(web3Provider);

    var AccountsArtifact = await $.getJSON('Accounts.json');
    // Get the necessary contract artifact file and instantiate it with truffle-contract

    var Accounts = TruffleContract(AccountsArtifact);

    // Set the provider for our contract
    Accounts.setProvider(web3Provider);

    // Use our contract to retrieve and mark the adopted pets
    accountInstance = await Accounts.deployed();

    if (accountInstance) {
        web3.eth.defaultAccount = web3.eth.accounts[0];

        var accountInfo = await accountInstance.getAccount(web3.eth.defaultAccount, { from: web3.eth.defaultAccount });
        if (accountInfo[0] === '0x00000000000000000000000000000000') {
            $("#signup").show();
            $("#login").show();
            $("#user").hide();
            alert("You did not register on this platform. You can sign up now! ")
            /*            $("#AccountDetail").hide();
                       $("#noAccount").show(); */
        }
        else {
            $("#signup").hide();
            $("#login").hide();
            $("#user").show();
            var _account = web3.eth.defaultAccount;
            let walletAddress = " " + _account.substring(0, 5) +
                "...." +
                _account.substring(_account.length - 5, _account.length);
            $("#useraddress").text(walletAddress);

        }
    }

}

async function initAccount(data) {
    if (accountInstance) {
        web3.eth.defaultAccount = web3.eth.accounts[0];

        var accountInfo = await accountInstance.getAccount(web3.eth.defaultAccount, { from: web3.eth.defaultAccount });
        if (accountInfo[0] === '0x00000000000000000000000000000000') {
            $("#signup").show();
            $("#login").show();
            $("#user").hide();
            /*            $("#AccountDetail").hide();
                       $("#noAccount").show(); */
        }
        else {
            $("#signup").hide();
            $("#login").hide();
            $("#user").show();
            var _account = web3.eth.defaultAccount;
            let walletAddress = " " + _account.substring(0, 5) +
                "...." +
                _account.substring(_account.length - 5, _account.length);
            $("#useraddress").text(walletAddress);

        }
    }
    if (App) {
        App.updateInterface();
    }
}
