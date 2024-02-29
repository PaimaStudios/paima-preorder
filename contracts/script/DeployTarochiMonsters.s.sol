// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/* solhint-disable no-console */
import "forge-std/Script.sol";
import "forge-std/console2.sol";

import {TarochiMonsters} from "../src/TarochiMonsters.sol";

contract DeployTarochiMonsters is Script {
    // Define NFT name
    string nftName = "Tarochi Monsters";
    // Define NFT symbol
    string nftSymbol = "TM";

    function run() external {
        address ownerAddress = vm.envAddress("DEPLOYMENT_CONTRACT_OWNER_ADDRESS");
        string memory baseURI = vm.envString("DEPLOYMENT_TAROCHI_MONSTERS_BASE_URI");
        vm.startBroadcast();

        // This is used to achieve deterministic deployment address across EVM chains.
        // The value does not matter, as long as it is invariant.
        bytes32 dummySalt = bytes32(uint256(1));

        TarochiMonsters nft = new TarochiMonsters{salt: dummySalt}(nftName, nftSymbol, ownerAddress);
        nft.setBaseURI(baseURI);

        console2.log("Tarochi Monsters NFT address:", address(nft));

        vm.stopBroadcast();
    }
}
