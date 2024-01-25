// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/* solhint-disable no-console */
import "forge-std/Script.sol";
import "forge-std/console2.sol";

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {TarochiSale} from "../src/TarochiSale.sol";
import {TarochiSeasonPassNft} from "../src/TarochiSeasonPassNft.sol";
import {Deploy} from "./Deploy.s.sol";

contract DeployLocalhost is Script {
    // Define sale deadline timestamp
    uint256 mintDeadline = 1707955200; // Thu Feb 15 2024 00:00:00 GMT+0000

    function runCommon(Deploy.DeployParams memory params) internal {
        address ownerAddress = vm.envAddress("LOCALCHAIN_DEPLOYER_ADDRESS");
        string memory nftUri = vm.envString("NFT_URI");
        vm.startBroadcast();

        TarochiSeasonPassNft nft =
            new TarochiSeasonPassNft(params.nftName, params.nftSymbol, params.nftMaxSupply, ownerAddress, mintDeadline);

        TarochiSale tarochiSaleImpl = new TarochiSale();
        bytes memory initializeData = abi.encodeWithSignature(
            "initialize(address,address,uint256,uint256)",
            ownerAddress,
            address(nft),
            params.nftNativePrice,
            params.nftErc20Price
        );
        ERC1967Proxy tarochiSaleProxy = new ERC1967Proxy(address(tarochiSaleImpl), initializeData);

        TarochiSale(address(tarochiSaleProxy)).whitelistTokens(params.supportedCurrencies);

        nft.setBaseExtension(nftUri);
        nft.setMinter(address(tarochiSaleProxy));

        console2.log("Tarochi NFT address:", address(nft));
        console2.log("Tarochi Sale implementation:", address(tarochiSaleImpl));
        console2.log("Tarochi Sale proxy:", address(tarochiSaleProxy));

        vm.stopBroadcast();
    }

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

        runCommon(
            Deploy.DeployParams(nftNativePrice, nftErc20Price, supportedCurrencies, nftName, nftSymbol, nftMaxSupply)
        );
    }
}
