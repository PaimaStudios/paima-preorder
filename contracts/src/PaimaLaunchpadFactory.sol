// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {PaimaLaunchpad} from "./PaimaLaunchpad.sol";

contract PaimaLaunchpadFactory is Ownable {
    /// @notice Address of the PaimaLaunchpad implementation contract
    address public launchpadImplementation;
    /// @notice Returns whether the address is whitelisted to deploy new launchpads.
    mapping(address => bool) public whitelistedDeployers;
    /// @notice If true, only whitelisted deployers can deploy new launchpads.
    bool public whitelistDeployersOnly;

    event LaunchpadDeployed(address launchpad);

    error PaimaLaunchpadFactory__InvalidZeroValue();
    error PaimaLaunchpadFactory__NotWhitelisted();

    constructor(address _launchpadImplementation, address _owner) Ownable(_owner) {
        if (_launchpadImplementation == address(0)) {
            revert PaimaLaunchpadFactory__InvalidZeroValue();
        }
        launchpadImplementation = _launchpadImplementation;
    }

    /// @notice Deploy a new launchpad. If whitelistDeployersOnly is true, only whitelisted deployers can deploy new launchpads.
    /// @param owner Owner of the deployed launchpad
    /// @param referrerRewardBps Referrer rewards in basis points
    /// @param acceptedPaymentTokens Accepted payment tokens
    /// @return Address of the new Launchpad contract.
    function deploy(address owner, uint256 referrerRewardBps, address[] memory acceptedPaymentTokens)
        external
        returns (address)
    {
        if (whitelistDeployersOnly && !whitelistedDeployers[msg.sender]) {
            revert PaimaLaunchpadFactory__NotWhitelisted();
        }
        bytes memory initializeData = abi.encodeWithSignature(
            "initialize(address,uint256,address[])", owner, referrerRewardBps, acceptedPaymentTokens
        );
        ERC1967Proxy launchpadProxy = new ERC1967Proxy(launchpadImplementation, initializeData);
        emit LaunchpadDeployed(address(launchpadProxy));
        return address(launchpadProxy);
    }

    /// @notice Set whether only whitelisted deployers can deploy new launchpads.
    /// @param _whitelistDeployersOnly If true, only whitelisted deployers can deploy new launchpads.
    /// @dev Only owner can call this function.
    function setWhitelistDeployersOnly(bool _whitelistDeployersOnly) external onlyOwner {
        whitelistDeployersOnly = _whitelistDeployersOnly;
    }

    /// @notice Set whether the address is whitelisted to deploy new launchpads.
    /// @param deployer Address to set whitelist status
    /// @param whitelisted If true, the address is whitelisted to deploy new launchpads.
    /// @dev Only owner can call this function.
    function setWhitelistedDeployer(address deployer, bool whitelisted) external onlyOwner {
        whitelistedDeployers[deployer] = whitelisted;
    }
}
