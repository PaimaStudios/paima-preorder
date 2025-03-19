// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/* solhint-disable no-console */
import "forge-std/Script.sol";
import "forge-std/console2.sol";

import {PaimaLaunchpad} from "../src/PaimaLaunchpad.sol";
import {PaimaLaunchpadFactory} from "../src/PaimaLaunchpadFactory.sol";

contract DeployLaunchpad is Script {
    function run() external {
        address ownerAddress = vm.envAddress("DEPLOYMENT_CONTRACT_OWNER_ADDRESS");
        bool whitelistDeployersOnly = vm.envBool("DEPLOYMENT_LAUNCHPAD_WHITELIST_ONLY");
        vm.startBroadcast();

        PaimaLaunchpad launchpad = new PaimaLaunchpad();
        PaimaLaunchpadFactory factory =
            new PaimaLaunchpadFactory(address(launchpad), ownerAddress, whitelistDeployersOnly);
        console2.log("PaimaLaunchpad implementation address:", address(launchpad));
        console2.log("PaimaLaunchpadFactory address:", address(factory));

        vm.stopBroadcast();
    }
}
