async function main() {
  const MyNFT = await ethers.getContractFactory("MyNFT");
  const nft = await MyNFT.deploy();

  await nft.waitForDeployment();

  console.log("MyNFT deployed to:", await nft.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
