var UserAccount = artifacts.require("./Accounts.sol");

contract('UserAccount', function (accounts) {
  it("Should set up an account", function () {
    return UserAccount.deployed().then(function (instance) {
      deployedUsers = instance;
      var firstname = web3.utils.asciiToHex("Kenneth");
      var lastname = web3.utils.asciiToHex("Hu");
      return deployedUsers.setAccount(accounts[0], firstname, lastname, "Biography", "email@email.com");
    }).then(function (userTrans) {
      return deployedUsers.getAccounts.call()
    }).then(function (accs) {
      return deployedUsers.getAccount.call(accs[0]);
    }).then(function (me) {
      assert.equal(web3.utils.toAscii(me[0]).replace(/\u0000/g, ''), "Kenneth", "Firstname returned incorrectly");
      assert.equal(web3.utils.toAscii(me[1]).replace(/\u0000/g, ''), "Hu", "Secondname returned incorrectly");
      assert.equal(me[5], "Biography", "Biography returned incorrectly");
      assert.equal(me[6], "email@email.com", "Email returned incorrectly");
    })
  });

  it("Should add a job to an accounts workerJobs list", function () {
    return UserAccount.deployed().then(function (instance) {
      deployedUsers = instance;
      var firstname = web3.utils.asciiToHex("Kenneth");
      var lastname = web3.utils.asciiToHex("Hu");
      return deployedUsers.setAccount(accounts[0], firstname, lastname, "Biography", "email@email.com");
    }).then(function (userTrans) {
      return deployedUsers.addWorkerJob(accounts[0], 1);
    }).then(function (tx) {
      return deployedUsers.getAccounts.call()
    }).then(function (accs) {
      return deployedUsers.getAccount.call(accs[0]);
    }).then(function (me) {
      assert.equal(me[3], 1, "Job ID returned incorrectly by getAccount");
      return deployedUsers.getWorkerJobs.call(accounts[0]);
    }).then(function (WorkerJobs) {
      assert.equal(WorkerJobs, 1, "jobId returned incorrectly by getWorkerJobs")
    })
  });

  it("Should add a job as employer", function () {
    return UserAccount.deployed().then(function (instance) {
      deployedUsers = instance;
      var firstname = web3.utils.asciiToHex("Alex");
      var lastname = web3.utils.asciiToHex("Hu");
      return deployedUsers.setAccount(accounts[0], firstname, lastname, "email@email.com", "Biography")
    }).then(function (userTrans) {
      return deployedUsers.addEmployerJob(accounts[0], 1);
    }).then(function (tx) {
      return deployedUsers.getAccounts.call()
    }).then(function (accs) {
      return deployedUsers.getAccount.call(accs[0]);
    }).then(function (me) {
      assert.equal(me[2], 1, "Job ID returned incorrectly by getAccount");
      return deployedUsers.getEmployerJobs.call(accounts[0]);
    }).then(function (employerJobs) {
      assert.equal(employerJobs, 1, "jobId returned incorrectly by getEmployerJobs")
    })
  });

  it("Should not return a registered account", function () {
    return UserAccount.deployed().then(function (instance) {
      return instance.getAccount(accounts[7])
    }).then(function (account) {
      var failureCase = ['0x00000000000000000000000000000000', '0x00000000000000000000000000000000']

      assert.equal(account[0], failureCase[0], "Firstname does not = null");
      assert.equal(account[1], failureCase[1], "Surename does not = null");
      assert.equal(account[2].length, 0, "employerJobs does not = null");
      assert.equal(account[3].length, 0, "workerJobs does not = null");
    })
  })

  it("Should get the total number of accounts", function () {
    return UserAccount.deployed().then(function (instance) {
      deployedUsers = instance;
      var firstname = web3.utils.asciiToHex("Kenneth");
      var lastname = web3.utils.asciiToHex("Hu");
      return deployedUsers.setAccount(accounts[0], firstname, lastname, "Kenneth@email.com", "Biography")
    }).then(function (userTrans) {
      var firstname = web3.utils.asciiToHex("Alex");
      var lastname = web3.utils.asciiToHex("Hu");
      return deployedUsers.setAccount(accounts[0], firstname, lastname, "Alex@email.com", "Biography")
    }).then(function (userTrans) {
      return deployedUsers.countAccounts()
    }).then(function (count) {
      assert.equal(count, 5, "the total number of accounts is not correct");
    })
  })

});
