const CROWDFUNDING_ADDRESS =
  "0xF9f189151C8bf0AaE92d95465068F4FEd194E95c";

const CROWDFUNDING_ABI = [
  "function campaignCount() view returns (uint256)",
  "function campaigns(uint256) view returns (string,address,uint256,uint256,uint256,bool)",
  "function contribute(uint256) payable"
];
const REWARD_TOKEN_ADDRESS =
  "0xF2D5f1Bf648cf7f6a5E15C5Fa3b6F5694D47Db98";

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)"
];


let provider;
let signer;
let readContract;
let writeContract;

async function loadCampaigns() {
  if (!window.ethereum) {
    alert("MetaMask not found");
    return;
  }

  // 1️⃣ provider
  provider = new ethers.BrowserProvider(window.ethereum);

  // 2️⃣ request accounts
  await provider.send("eth_requestAccounts", []);

  // 3️⃣ signer
  signer = await provider.getSigner();

  // 4️⃣ contracts
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

    const title = c[0];
    const creator = c[1];
    const goal = ethers.formatEther(c[2]);
    const deadline = new Date(Number(c[3]) * 1000);
    const raised = ethers.formatEther(c[4]);
    const finished = c[5];

    if (finished) continue;

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
async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask not found");
    return;
  }

  provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = await provider.getSigner();

  const address = await signer.getAddress();
  document.getElementById("walletAddress").innerText =
    address.slice(0, 6) + "..." + address.slice(-4);

  await checkNetwork();
  await loadBalances();
}
async function checkNetwork() {
  const network = await provider.getNetwork();

  // Sepolia = 11155111
  if (network.chainId !== 11155111n) {
    alert("⚠️ Please switch MetaMask to Sepolia network");
  }
}
async function loadBalances() {
  const address = await signer.getAddress();

  // ETH
  const ethBalance = await provider.getBalance(address);
  document.getElementById("ethBalance").innerText =
    "ETH: " + ethers.formatEther(ethBalance);

  // ERT
  const ert = new ethers.Contract(
    REWARD_TOKEN_ADDRESS,
    ERC20_ABI,
    provider
  );

  const decimals = await ert.decimals();
  const ertBalance = await ert.balanceOf(address);

  document.getElementById("ertBalance").innerText =
    "ERT: " + (Number(ertBalance) / 10 ** decimals);
}


async function contribute(id) {
  try {
    if (!signer) {
      await connectWallet();
    }

    const amount = document.getElementById(`amount-${id}`).value;
    if (!amount || amount <= 0) {
      alert("Enter ETH amount");
      return;
    }

    const tx = await writeContract.contribute(id, {
      value: ethers.parseEther(amount)
    });

    await tx.wait();
    alert("✅ Funded successfully");

    await loadBalances();
    loadCampaigns();

  } catch (err) {
    console.error(err);
    alert("❌ Transaction failed or rejected");
  }
}



window.addEventListener("load", loadCampaigns);
