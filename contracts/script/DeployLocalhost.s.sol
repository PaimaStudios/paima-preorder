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
    // Define NFT name
    string nftName = "Tarochi Season 1 Pass";
    // Define NFT symbol
    string nftSymbol = "TSP1";
    // Define NFT max supply (unlimited)
    uint256 nftMaxSupply = type(uint256).max;

    function runCommon(Deploy.DeployParams memory params) internal {
        uint256 mintDeadline = vm.envUint("DEPLOYMENT_SALE_DEADLINE");
        address ownerAddress = vm.envAddress("LOCALCHAIN_DEPLOYER_ADDRESS");
        string memory nftUri = vm.envString("DEPLOYMENT_NFT_URI");
        vm.startBroadcast();

        TarochiSeasonPassNft nft =
            new TarochiSeasonPassNft(nftName, nftSymbol, nftMaxSupply, ownerAddress, mintDeadline);

        TarochiSale tarochiSaleImpl = new TarochiSale();
        bytes memory initializeData = abi.encodeWithSignature(
            "initialize(address,address,uint256,uint256)",
            ownerAddress,
            address(nft),
            params.nftNativePrice,
            params.nftErc20Price
        );
        ERC1967Proxy tarochiSaleProxy = new ERC1967Proxy(address(tarochiSaleImpl), initializeData);

        IERC20[] memory supportedCurrencies = new IERC20[](params.supportedCurrencies.length);
        for (uint256 i = 0; i < supportedCurrencies.length; i++) {
            supportedCurrencies[i] = IERC20(params.supportedCurrencies[i]);
        }
        TarochiSale(address(tarochiSaleProxy)).whitelistTokens(supportedCurrencies);

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
        address[] memory supportedCurrencies = new address[](1);
        supportedCurrencies[0] = 0xF200edFf719b0519eb3ced3cc05802D493A04ca8; // USDC

        runCommon(Deploy.DeployParams(nftNativePrice, nftErc20Price, supportedCurrencies));
    }
}
