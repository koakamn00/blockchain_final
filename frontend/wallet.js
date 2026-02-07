async function connectWallet() {
  if (typeof window.ethereum !== "object") {
    alert(
      "MetaMask is not available.\n" +
      "Please open this site in Chrome with MetaMask enabled."
    );
    return;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);


  await provider.send("eth_requestAccounts", []);

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
      alert("Failed to switch MetaMask to Localhost");
      return;
    }
  }

  const network = await provider.getNetwork();
  if (network.chainId !== 31337n) {
    alert("Please switch MetaMask to Hardhat Localhost");
    return;
  }

  const role = localStorage.getItem("role");
  window.location.href = role === "engineer"
    ? "engineer.html"
    : "user.html";
}
