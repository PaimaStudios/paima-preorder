// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/* solhint-disable no-console */
import "forge-std/Script.sol";
import "forge-std/console2.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {Deploy} from "./Deploy.s.sol";

contract DeployArbTestnet is Deploy {
    function run() external {
        // Define supported ERC20 payment tokens
        address[] memory supportedCurrencies = new address[](1);
        supportedCurrencies[0] = 0xEa4aa9F8C0Ab419F6C7a79760D9935a41FfaA62E; // USDC

        runCommon(Deploy.DeployParams(supportedCurrencies));
    }
}
