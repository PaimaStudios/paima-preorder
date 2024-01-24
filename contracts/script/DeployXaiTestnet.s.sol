// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/* solhint-disable no-console */
import "forge-std/Script.sol";
import "forge-std/console2.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {Deploy} from "./Deploy.s.sol";

contract DeployXaiTestnet is Deploy {
    function run() external {
        // Define sale price in native gas tokens
        uint256 nftNativePrice = 0.001 ether;
        // Define sale price in supported ERC20 tokens
        uint256 nftErc20Price = 100 * 1e6;
        // Define supported ERC20 payment tokens
        IERC20[] memory supportedCurrencies = new IERC20[](1);
        supportedCurrencies[0] = IERC20(0xF200edFf719b0519eb3ced3cc05802D493A04ca8); // USDC
        // Define NFT name
        string memory nftName = "Tarochi Season 1 Pass";
        // Define NFT symbol
        string memory nftSymbol = "TSP1";
        // Define NFT max supply (unlimited)
        uint256 nftMaxSupply = type(uint256).max;
        // Define sale deadline timestamp
        uint256 mintDeadline = 1707955200; // Thu Feb 15 2024 00:00:00 GMT+0000

        runCommon(
            Deploy.DeployParams(
                nftNativePrice, nftErc20Price, supportedCurrencies, nftName, nftSymbol, nftMaxSupply, mintDeadline
            )
        );
    }
}
