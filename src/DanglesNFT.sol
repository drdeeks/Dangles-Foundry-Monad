// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "lib/openzeppelin-contracts/contracts/access/Ownable.sol";

contract DanglesNFT is ERC721, Ownable {
    uint256 public nextTokenId;
    uint256 public constant MAX_SUPPLY = 1111;
    mapping(address => bool) public hasMinted;
    mapping(uint256 => string) private _tokenURIs;

    constructor() 
        ERC721("Dangles: The Jumping Jackass", "DANGLES")
        Ownable(msg.sender)
    {}

    function mint(string memory tokenURI_) external {
        require(!hasMinted[msg.sender], "Already minted");
        require(nextTokenId < MAX_SUPPLY, "Max supply reached");
        uint256 tokenId = nextTokenId;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI_);
        hasMinted[msg.sender] = true;
        nextTokenId++;
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal {
        require(ownerOf(tokenId) != address(0), "URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }

    /**
     * @dev Override the tokenURI function to return the same URI for all tokens
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _tokenURIs[tokenId];
    }
}