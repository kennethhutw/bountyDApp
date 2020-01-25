const HDWalletProvider = require("@truffle/hdwallet-provider");
const mnemonic = "maximum future leave orange taxi code delay modify afford outer amazing idle";
/* 
var HDWalletProvider = require('truffle-hdwallet-provider');
var mnemonic = "maximum future leave orange taxi code delay modify afford outer amazing idle"
 */
module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      provider: function () {
        return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/1ca8cfbe21624ba8a6740938b390e2dc")
      },
      network_id: 4
    },
    ropsten: {
      // must be a thunk, otherwise truffle commands may hang in CI
      provider: () =>
        new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/1ca8cfbe21624ba8a6740938b390e2dc",
          0, 1, true, "m/44'/60'/0'/0/"
        ),
      network_id: '3',
    }
  }
};
