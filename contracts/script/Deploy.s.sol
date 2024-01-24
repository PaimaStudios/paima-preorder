// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/* solhint-disable no-console */
import "forge-std/Script.sol";
import "forge-std/console2.sol";

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {TarochiSale} from "../src/TarochiSale.sol";
import {TarochiSeasonPassNft} from "../src/TarochiSeasonPassNft.sol";

contract Deploy is Script {
    struct DeployParams {
        uint256 nftNativePrice;
        uint256 nftErc20Price;
        IERC20[] supportedCurrencies;
        string nftName;
        string nftSymbol;
        uint256 nftMaxSupply;
        uint256 mintDeadline;
    }

    function runCommon(DeployParams memory params) internal {
        address ownerAddress = vm.envAddress("CONTRACT_OWNER_ADDRESS");
        string memory nftUri = vm.envString("NFT_URI");
        vm.startBroadcast();

        // This is used to achieve deterministic deployment address across EVM chains.
        // The value does not matter, as long as it is invariant.
        bytes32 dummySalt = bytes32(uint256(1));

        TarochiSeasonPassNft nft = new TarochiSeasonPassNft{salt: dummySalt}(
            params.nftName, params.nftSymbol, params.nftMaxSupply, ownerAddress, params.mintDeadline
        );

        TarochiSale tarochiSaleImpl = new TarochiSale{salt: dummySalt}();
        bytes memory initializeData = abi.encodeWithSignature(
            "initialize(address,address,uint256,uint256)",
            ownerAddress,
            address(nft),
            params.nftNativePrice,
            params.nftErc20Price
        );
        ERC1967Proxy tarochiSaleProxy = new ERC1967Proxy{salt: dummySalt}(address(tarochiSaleImpl), initializeData);

        TarochiSale(address(tarochiSaleProxy)).whitelistTokens(params.supportedCurrencies);

        nft.setBaseExtension(nftUri);
        nft.setMinter(address(tarochiSaleProxy));

        console2.log("Tarochi NFT address:", address(nft));
        console2.log("Tarochi Sale implementation:", address(tarochiSaleImpl));
        console2.log("Tarochi Sale proxy:", address(tarochiSaleProxy));

        vm.stopBroadcast();
    }
}
