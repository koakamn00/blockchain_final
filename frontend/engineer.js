const CROWDFUNDING_ADDRESS ="0xF9f189151C8bf0AaE92d95465068F4FEd194E95c";


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
  const signer = await provider.getSigner();

  const network = await provider.getNetwork();
  if (network.chainId !== 11155111n) {
    alert("Please switch to Sepolia");
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
