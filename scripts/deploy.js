const hre = require("hardhat");

async function main() {
  const RewardToken = await hre.ethers.getContractFactory("RewardToken");
  const rewardToken = await RewardToken.deploy();
  await rewardToken.waitForDeployment();

  const Crowdfunding = await hre.ethers.getContractFactory("Crowdfunding");
  const crowdfunding = await Crowdfunding.deploy(
    await rewardToken.getAddress()
  );
  await crowdfunding.waitForDeployment();


  await rewardToken.transferOwnership(
    await crowdfunding.getAddress()
  );


  console.log("RewardToken:", await rewardToken.getAddress());
  console.log("Crowdfunding:", await crowdfunding.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
