// var Adoption = artifacts.require("Adoption");

// module.exports = function (deployer) {
//     deployer.deploy(Adoption);
// };


var BountyPost = artifacts.require("./BountyPost.sol");
var UserAccount = artifacts.require("./Accounts.sol");
var Review = artifacts.require("./Reviews.sol");

module.exports = function (deployer) {
  deployer.deploy(BountyPost);
  deployer.deploy(UserAccount);
  deployer.deploy(Review);
};
