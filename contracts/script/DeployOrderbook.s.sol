// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/* solhint-disable no-console */
import "forge-std/Script.sol";
import "forge-std/console2.sol";

import { OrderbookDex } from "paima-evm-contracts-v3/contracts/orderbook/OrderbookDex.sol";
import { OrderbookDexProxy } from "paima-evm-contracts-v3/contracts/Proxy/OrderbookDexProxy.sol";

contract DeployOrderbookDex is Script {
    function run() external {
        address ownerAddress = vm.envAddress("DEPLOYMENT_CONTRACT_OWNER_ADDRESS");
        vm.startBroadcast();

        // This is used to achieve deterministic deployment address across EVM chains.
        // The value does not matter, as long as it is invariant.
        bytes32 dummySalt = bytes32(uint256(1));

        OrderbookDex dex = new OrderbookDex{salt: dummySalt}();
        OrderbookDexProxy dexProxy = new OrderbookDexProxy{salt: dummySalt}(
          address(dex),
          ownerAddress,
          // OpenSea has a 2.5% fee, so this is the same thing (1.25% taker + 1.25% maker)
          125, // _defaultMakerFee,
          125, // _defaultTakerFee,
          30000000000000 // 30000 gwei, _orderCreationFee
        );
        console2.log("Orderbook DEX implementation address:", address(dex));
        console2.log("Orderbook DEX proxy address:", address(dexProxy));

        vm.stopBroadcast();
    }
}
