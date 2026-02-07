let provider;
let signer;
let crowdfunding;

const CROWDFUNDING_ADDRESS = "PASTE_ADDRESS_HERE";

const CROWDFUNDING_ABI = [
  "function createCampaign(string title, uint goal, uint duration)",
  "function fundCampaign(uint campaignId) payable"
];

async function connectMetaMask() {
  if (!window.ethereum) {
    alert("Install MetaMask");
    return;
  }

  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();

  const address = await signer.getAddress();
  document.getElementById("account").innerText =
    "Connected: " + address;

  crowdfunding = new ethers.Contract(
    CROWDFUNDING_ADDRESS,
    CROWDFUNDING_ABI,
    signer
  );
}

document.getElementById("connectBtn").onclick = connectMetaMask;

function showEngineer() {
  document.getElementById("engineer").classList.remove("hidden");
  document.getElementById("user").classList.add("hidden");
}

function showUser() {
  document.getElementById("user").classList.remove("hidden");
  document.getElementById("engineer").classList.add("hidden");
}

async function createCampaign() {
  const title = document.getElementById("title").value;
  const goal = document.getElementById("goal").value;
  const duration = document.getElementById("duration").value;

  const goalWei = ethers.parseEther(goal);

  const tx = await crowdfunding.createCampaign(
    title,
    goalWei,
    duration
  );
  await tx.wait();

  alert("Campaign created!");
}

async function fundCampaign() {
  const id = document.getElementById("campaignId").value;
  const amount = document.getElementById("amount").value;

  const tx = await crowdfunding.fundCampaign(id, {
    value: ethers.parseEther(amount)
  });
  await tx.wait();

  alert("Funded successfully!");
}
