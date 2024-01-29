// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/* solhint-disable no-console */
import "forge-std/Script.sol";
import "forge-std/console2.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {Deploy} from "./Deploy.s.sol";

contract DeployArbMainnet is Deploy {
    address[] supportedCurrencies;

    function run() external {
        // Define sale price in native gas tokens
        uint256 nftNativePrice = vm.envUint("DEPLOYMENT_ARBITRUM_NATIVE_PRICE");
        // Define sale price in supported ERC20 tokens
        uint256 nftErc20Price = vm.envUint("DEPLOYMENT_ARBITRUM_ERC20_PRICE");
        // Define supported ERC20 payment tokens
        supportedCurrencies = vm.envOr("DEPLOYMENT_ARBITRUM_SUPPORTED_ERC20_TOKENS", ",", supportedCurrencies);

        runCommon(Deploy.DeployParams(nftNativePrice, nftErc20Price, supportedCurrencies));
    }
}
