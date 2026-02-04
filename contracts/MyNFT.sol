// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721URIStorage, Ownable {
    uint256 public tokenIdCounter;

    constructor() ERC721("MyNFT", "MNFT") Ownable(msg.sender) {
        tokenIdCounter = 0;
    }

    function mint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = tokenIdCounter;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        tokenIdCounter++;
    }
}
