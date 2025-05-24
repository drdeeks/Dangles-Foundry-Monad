// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "forge-std/Test.sol";

contract SampleTest is Test {
    function testExample() public {
        assertEq(uint256(1), uint256(1), "1 should equal 1");
    }
}
