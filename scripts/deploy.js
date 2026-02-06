async function main() {
  const Token = await ethers.getContractFactory("RewardToken");
  const token = await Token.deploy();
  await token.waitForDeployment();

  const Crowdfunding = await ethers.getContractFactory("Crowdfunding");
  const crowdfunding = await Crowdfunding.deploy(await token.getAddress());
  await crowdfunding.waitForDeployment();

  await token.transferOwnership(await crowdfunding.getAddress());

  console.log("RewardToken:", await token.getAddress());
  console.log("Crowdfunding:", await crowdfunding.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
