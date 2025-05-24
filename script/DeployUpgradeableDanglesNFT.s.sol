// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/UpgradeableDanglesNFT.sol";
import "openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract DeployUpgradeableDanglesNFT is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        // Changed from BASE_TOKEN_URI to COMMON_TOKEN_URI to reflect the new naming
        string memory commonTokenURI = vm.envString("COMMON_TOKEN_URI");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the implementation contract
        UpgradeableDanglesNFT implementation = new UpgradeableDanglesNFT();
        
        // Prepare initialization data
        bytes memory initData = abi.encodeWithSelector(
            UpgradeableDanglesNFT.initialize.selector,
            commonTokenURI
        );
        
        // Deploy the proxy
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(implementation),
            initData
        );
        
        
        vm.stopBroadcast();
        
        console.log("Implementation deployed to:", address(implementation));
        console.log("Proxy deployed to:", address(proxy));
        console.log("Common Token URI set to:", commonTokenURI);
    }
}