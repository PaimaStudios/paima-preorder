// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/* solhint-disable no-console */
import "forge-std/Script.sol";
import "forge-std/console2.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {Deploy} from "./Deploy.s.sol";

contract DeployArbMainnet is Deploy {
    function run() external {
        // Define sale price in native gas tokens
        uint256 nftNativePrice = 0.001 ether;
        // Define sale price in supported ERC20 tokens
        uint256 nftErc20Price = 100 * 1e6;
        // Define supported ERC20 payment tokens
        IERC20[] memory supportedCurrencies = new IERC20[](2);
        supportedCurrencies[0] = IERC20(0xaf88d065e77c8cC2239327C5EDb3A432268e5831); // USDC
        supportedCurrencies[1] = IERC20(0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9); // USDT
        // Define NFT name
        string memory nftName = "Tarochi Season 1 Pass";
        // Define NFT symbol
        string memory nftSymbol = "TSP1";
        // Define NFT max supply (unlimited)
        uint256 nftMaxSupply = type(uint256).max;

        runCommon(
            Deploy.DeployParams(nftNativePrice, nftErc20Price, supportedCurrencies, nftName, nftSymbol, nftMaxSupply)
        );
    }
}
