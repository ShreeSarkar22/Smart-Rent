// require("@nomicfoundation/hardhat-toolbox");

// /** @type import('hardhat/config').HardhatUserConfig */
// module.exports = {
//   solidity: "0.8.28",
// };

require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    // Localhost configuration
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337, // Matches standard Hardhat node
    },
  },
  paths: {
    // This is the magic line that fixes your error:
    artifacts: "./frontend/src/artifacts",
  },
};