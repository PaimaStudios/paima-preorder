// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/* solhint-disable no-console */
import "forge-std/Script.sol";
import "forge-std/console2.sol";

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import "../src/TarochiSale.sol";
import {TarochiSeasonPassNft} from "../src/TarochiSeasonPassNft.sol";

contract Deploy is Script {
    function run() external {
        // Define sale price in native gas tokens
        uint256 nftNativePrice = 0.001 ether;
        // Define sale price in supported ERC20 tokens
        uint256 nftErc20Price = 1 * 1e6;
        // Define NFT name
        string memory nftName = "Tarochi Season 1 Pass";
        // Define NFT symbol
        string memory nftSymbol = "TAR1";
        // Define NFT max supply
        uint256 nftMaxSupply = type(uint256).max;
        // Define sale deadline timestamp
        // Thu Feb 15 2024 00:00:00 GMT+0000
        uint256 mintDeadline = 1707955200;

        address ownerAddress = vm.envAddress("CONTRACT_OWNER_ADDRESS");
        string memory nftUri = vm.envString("NFT_URI");
        vm.startBroadcast();

        // This is used to achieve deterministic deployment address across EVM chains.
        // The value does not matter, as long as it is invariant.
        bytes32 dummySalt = bytes32(uint256(1));

        TarochiSeasonPassNft nft =
            new TarochiSeasonPassNft{salt: dummySalt}(nftName, nftSymbol, nftMaxSupply, ownerAddress, mintDeadline);
        nft.setBaseExtension(nftUri);

        TarochiSale tarochiSaleImpl = new TarochiSale{salt: dummySalt}();
        bytes memory initializeData = abi.encodeWithSignature(
            "initialize(address,address,uint256,uint256)", ownerAddress, address(nft), nftNativePrice, nftErc20Price
        );
        ERC1967Proxy tarochiSaleProxy = new ERC1967Proxy{salt: dummySalt}(address(tarochiSaleImpl), initializeData);

        console2.log("Tarochi NFT address:", address(nft));
        console2.log("Tarochi Sale implementation:", address(tarochiSaleImpl));
        console2.log("Tarochi Sale proxy:", address(tarochiSaleProxy));

        vm.stopBroadcast();
    }
}
