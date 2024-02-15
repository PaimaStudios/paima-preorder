// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/* solhint-disable no-console */
import "forge-std/Script.sol";
import "forge-std/console2.sol";

import {TarochiGenesisTrainer} from "../src/TarochiGenesisTrainer.sol";

contract DeployGenesisTrainer is Script {
    // Define NFT baseURI
    string baseURI = "ipfs://bafybeierl3xmecbsrcysbgr5zdxfvx4w2ua6pf7iwbbrd2izosdpcwm7li/";

    function run() external {
        address ownerAddress = vm.envAddress("DEPLOYMENT_CONTRACT_OWNER_ADDRESS");
        address royaltyAddress = vm.envAddress("DEPLOYMENT_NFT_ROYALTY_ADDRESS");
        vm.startBroadcast();

        // This is used to achieve deterministic deployment address across EVM chains.
        // The value does not matter, as long as it is invariant.
        bytes32 dummySalt = bytes32(uint256(1));

        TarochiGenesisTrainer nft = new TarochiGenesisTrainer{salt: dummySalt}(baseURI, ownerAddress, royaltyAddress);

        console2.log("Tarochi Genesis Trainer NFT address:", address(nft));

        vm.stopBroadcast();
    }
}
