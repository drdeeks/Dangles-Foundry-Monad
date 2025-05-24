// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts-upgradeable/contracts/token/ERC721/ERC721Upgradeable.sol";
import "openzeppelin-contracts-upgradeable/contracts/access/OwnableUpgradeable.sol";
import "openzeppelin-contracts/contracts/proxy/utils/UUPSUpgradeable.sol";

contract UpgradeableDanglesNFT is ERC721Upgradeable, OwnableUpgradeable, UUPSUpgradeable {
    uint256 public nextTokenId;
    uint256 public constant MAX_SUPPLY = 1111;
    mapping(address => bool) public hasMinted;
    mapping(uint256 => string) private _tokenURIs;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __ERC721_init("Dangles: The Jumping Jackass", "DANGLES");
        __Ownable_init(msg.sender);
    }

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

    /**
     * @dev Function that authorizes upgrades, only callable by owner
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}