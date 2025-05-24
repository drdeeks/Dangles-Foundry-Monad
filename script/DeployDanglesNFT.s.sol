// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/DanglesNFT.sol";

contract DeployDanglesNFT is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        // Changed from BASE_TOKEN_URI to COMMON_TOKEN_URI to reflect the new naming
        string memory commonTokenURI = vm.envString("COMMON_TOKEN_URI");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the NFT contract with no constructor arguments
        DanglesNFT nft = new DanglesNFT();
        
        vm.stopBroadcast();
        
        console.log("DanglesNFT deployed to:", address(nft));
        console.log("Common Token URI set to:", commonTokenURI);
    }
}
