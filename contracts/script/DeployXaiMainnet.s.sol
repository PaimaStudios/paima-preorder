// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/* solhint-disable no-console */
import "forge-std/Script.sol";
import "forge-std/console2.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {Deploy} from "./Deploy.s.sol";

contract DeployXaiMainnet is Deploy {
    address[] supportedCurrencies;

    function run() external {
        // Define supported ERC20 payment tokens
        supportedCurrencies = vm.envOr("DEPLOYMENT_XAI_SUPPORTED_ERC20_TOKENS", ",", supportedCurrencies);

        runCommon(Deploy.DeployParams(supportedCurrencies));
    }
}
