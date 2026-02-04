async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const recipient = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";
  const tokenURI = "ipfs://bafkreici7lsjoovlboxrw323tmvux3bzh3l3oear4vasvttenklyfe5zn4";

  const MyNFT = await ethers.getContractFactory("MyNFT");
  const nft = MyNFT.attach(contractAddress);

  const tx = await nft.mint(recipient, tokenURI);
  await tx.wait();

  console.log("NFT minted with metadata!");
}

main().catch(console.error);
