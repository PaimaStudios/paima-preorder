// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/* solhint-disable no-console */
import "forge-std/Script.sol";
import "forge-std/console2.sol";

import {TarochiMonsterTrading} from "../src/TarochiMonsterTrading.sol";

contract DeployMonsterTrading is Script {
    // Define NFT baseURI
    
    // mainnet
    string baseURI = "https://tarochi-backend-xai-mainnet.paimastudios.com/inverseProjection/prc3/monsters/";
    // testnet
    // string baseURI = "https://tarochi-backend-testnet-c1.paimastudios.com/inverseProjection/prc3/monsters/";

    function run() external {
        address ownerAddress = vm.envAddress("DEPLOYMENT_CONTRACT_OWNER_ADDRESS");
        address royaltyAddress = vm.envAddress("DEPLOYMENT_NFT_ROYALTY_ADDRESS");
        vm.startBroadcast();

        // This is used to achieve deterministic deployment address across EVM chains.
        // The value does not matter, as long as it is invariant.
        bytes32 dummySalt = bytes32(uint256(1));

        TarochiMonsterTrading nft = new TarochiMonsterTrading{salt: dummySalt}(baseURI, ownerAddress, royaltyAddress);
        // TarochiMonsterTrading nft = TarochiMonsterTrading(address(0xd4F427A6b459a17d7055c7cF4644fF641Bb599DD));

        console2.log("Monster Trading NFT address:", address(nft));
        // nft.setBaseURI(baseURI);

        // note: you won't be able to create the OpenSea page unless at least 1 NFT is minted for the contract
        //       this mint will be blank (not recognized by the game), but can help test
        // nft.mint(ownerAddress, "");

        vm.stopBroadcast();
    }
}
