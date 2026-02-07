const CROWDFUNDING_ADDRESS =
  "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";

const CROWDFUNDING_ABI = [
  "function campaignCount() view returns (uint256)",
  "function campaigns(uint256) view returns (string title, address creator, uint256 goal, uint256 deadline, uint256 totalRaised, bool finalized, bool successful)",
  "function contribute(uint256) payable"
];

const REWARD_TOKEN_ADDRESS =
  "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

let provider;
let signer;
let readContract;
let writeContract;

async function checkNetwork() {
  const network = await provider.getNetwork();

  if (network.chainId !== 31337n) {
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
        alert("Failed to switch to Localhost");
        throw error;
      }
    }
  }
}




async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask not found");
    return;
  }

  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();

  await checkNetwork();

  const address = await signer.getAddress();
  document.getElementById("walletAddress").innerText =
    address.slice(0, 6) + "..." + address.slice(-4);

  await loadBalances();
}

async function loadBalances() {
  const address = await signer.getAddress();


  const ethBalance = await provider.getBalance(address);
  document.getElementById("ethBalance").innerText =
    "ETH: " + ethers.formatEther(ethBalance);


  const ert = new ethers.Contract(
    REWARD_TOKEN_ADDRESS,
    ERC20_ABI,
    provider
  );

  const decimals = await ert.decimals();
  const ertBalance = await ert.balanceOf(address);
  const formattedERT = ethers.formatUnits(ertBalance, decimals);

document.getElementById("ertBalance").innerText =
  "ERT: " + formattedERT;


  document.getElementById("ertBalance").innerText =
    "ERT: " + Number(ertBalance) / 10 ** decimals;
}


async function loadCampaigns() {
  if (!window.ethereum) {
    alert("MetaMask not found");
    return;
  }

  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();

  await checkNetwork();

  readContract = new ethers.Contract(
    CROWDFUNDING_ADDRESS,
    CROWDFUNDING_ABI,
    provider
  );

  writeContract = new ethers.Contract(
    CROWDFUNDING_ADDRESS,
    CROWDFUNDING_ABI,
    signer
  );

  const container = document.getElementById("campaigns");
  container.innerHTML = "";

  const count = await readContract.campaignCount();

  for (let i = 0; i < count; i++) {
    const c = await readContract.campaigns(i);

    const title = c.title;
    const creator = c.creator;
    const goal = ethers.formatEther(c.goal);
    const deadline = new Date(Number(c.deadline) * 1000);
    const raised = ethers.formatEther(c.totalRaised);
    const finalized = c.finalized;

    if (finalized) continue;

    const div = document.createElement("div");
    div.className = "campaign";

    div.innerHTML = `
      <h3>${title}</h3>
      <p><b>Creator:</b> ${creator.slice(0, 6)}…</p>
      <p><b>Goal:</b> ${goal} ETH</p>
      <p><b>Raised:</b> ${raised} ETH</p>
      <p><b>Deadline:</b> ${deadline.toLocaleString()}</p>

      <div class="fund-row">
        <input
          type="number"
          placeholder="ETH amount"
          id="amount-${i}"
          min="0.001"
          step="0.001"
        />
        <button class="btn" onclick="contribute(${i})">
          Fund Project
        </button>
      </div>
    `;

    container.appendChild(div);
  }
}


async function contribute(id) {
  if (!signer) {
    await connectWallet();
  }

  const amount = document.getElementById(`amount-${id}`).value;
  if (!amount || amount <= 0) {
    alert("Enter ETH amount");
    return;
  }

  let tx;

  try {
    tx = await writeContract.contribute(id, {
      value: ethers.parseEther(amount)
    });

    await tx.wait();

    alert("Funded successfully");

  } catch (err) {
    console.error("TX ERROR:", err);
    alert("Transaction rejected by user or reverted");
    return;
  }

  
  try {
    await loadBalances();
    await loadCampaigns();
  } catch (uiErr) {
    console.warn("UI update error:", uiErr);
  }
}
async function fundCampaign() {
  if (!window.ethereum) {
    alert("MetaMask not found");
    return;
  }

  const campaignId = document.getElementById("campaignId").value;
  const amountEth = document.getElementById("amount").value;

  if (!campaignId || !amountEth) {
    alert("Fill all fields");
    return;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();

  const contract = new ethers.Contract(
    CROWDFUNDING_ADDRESS,
    CROWDFUNDING_ABI,
    signer
  );

  try {
    const tx = await contract.contribute(campaignId, {
      value: ethers.parseEther(amountEth)
    });

    await tx.wait();
    alert("Campaign funded successfully");

  } catch (err) {
    console.error(err);
    alert("Transaction failed");
  }
}


window.addEventListener("load", loadCampaigns);
