const CROWDFUNDING_ADDRESS =
  "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";

const CROWDFUNDING_ABI = [
  "function createCampaign(string title, uint256 goal, uint256 duration)"
];

let contract;

async function createCampaign() {
  if (!window.ethereum) {
    alert("MetaMask not available");
    return;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);


  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();

  
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x7A69" }] 
    });
  } catch (error) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: "0x7A69",
          chainName: "Hardhat Localhost",
          rpcUrls: ["http://127.0.0.1:8545"],
          nativeCurrency: {
            name: "Ethereum",
            symbol: "ETH",
            decimals: 18
          }
        }]
      });
    } else {
      alert("Failed to switch network");
      return;
    }
  }

  const network = await provider.getNetwork();
  if (network.chainId !== 31337n) {
    alert("Please switch MetaMask to Localhost");
    return;
  }

  contract = new ethers.Contract(
    CROWDFUNDING_ADDRESS,
    CROWDFUNDING_ABI,
    signer
  );

  const title = document.getElementById("title").value;
  const goalEth = document.getElementById("goal").value;
  const duration = document.getElementById("duration").value;

  const goalWei = ethers.parseEther(goalEth);

  document.getElementById("status").innerText =
    "Waiting for transaction confirmation...";

  const tx = await contract.createCampaign(
    title,
    goalWei,
    duration
  );

  await tx.wait();

  document.getElementById("status").innerText =
    "Campaign created successfully!";
}
