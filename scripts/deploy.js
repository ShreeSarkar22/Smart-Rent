const hre = require("hardhat");

async function main() {
  const RentAgreement = await hre.ethers.getContractFactory("RentAgreement");
  const rentAgreement = await RentAgreement.deploy();

  await rentAgreement.waitForDeployment();

  console.log("Contract deployed to:", await rentAgreement.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});