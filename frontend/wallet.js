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

  const network = await provider.getNetwork();
  if (network.chainId !== 11155111n) {
    alert("Please switch MetaMask to Sepolia Test Network");
    return;
  }

  const role = localStorage.getItem("role");
  window.location.href = role === "engineer"
    ? "engineer.html"
    : "user.html";
}
