# Paima Launchpad

This is a repository with smart contracts and backend architecture for Paima Launchpad, using Paima Engine. Paima Launchpad is a part of [Paima Asset Portal](https://github.com/PaimaStudios/paima-portal).

## Smart Contracts

Solidity smart contracts are located in the `contracts` folder. Refer to the README file in that folder to get started with development.

### PaimaLaunchpad.sol

Paima Launchpad contract is using the UUPS (Universal Upgradeable Proxy Standard) pattern, so it's possible to upgrade already deployed contracts via the `upgradeToAndCall` function.
It also inherits the `OwnableUpgradeable` contract for access control to some administrative functions.

#### Initialize function

`initialize(address _owner, uint256 _referrerRewardBps, address[] memory _acceptedPaymentTokens)`

- `_owner`
  - the owner of the Paima Launchpad contract
- `_referrerRewardBps`
  - the referrer reward in basis points, e.g. `100` would mean 100 basis points, meaning 1%. Smallest non-zero value is therefore 1 basis point = 0.01%. Use 0 if no referrer reward is desired.
- `_acceptedPaymentTokens`
  - the array of ERC20 token addresses that are accepted for payment. Use empty array if no ERC20 are to be accepted.

#### User functions

The core of the contract functionality are the two functions that users interact with:

- `buyItemsNative(address receiver, address payable referrer, uint256[] calldata itemsIds, uint256[] calldata itemsQuantities)`
  - For purchasing items with the native gas token (e.g. ETH on Ethereum)
- `buyItemsErc20(address paymentToken, uint256 paymentAmount, address receiver, address referrer, uint256[] calldata itemsIds, uint256[] calldata itemsQuantities)`
  - For purchasing items with ERC20 tokens that the contract has set in the `acceptedPaymentToken` mapping

Both these functions:

- perform some simple checks (cannot use yourself or `receiver` as the `referrer`, cannot use `address(0)` as the `receiver`, cannot use non-accepted ERC20 token as the `paymentToken`)
- take the payment
- if a `referrer` is not `address(0)`, calculate a portion of the referrer reward (defined with `referrerRewardBps`), if it's not zero transfer it to the `referrer`
- emit a `BuyItems(address indexed receiver, address indexed buyer, address indexed paymentToken, uint256 amount, address referrer, uint256[] itemsIds, uint256[] itemsQuantities)` event logging the user's selection of items and quantities, along with other information.

The contract **DOES NOT** validate the validity of this selection whatsoever, e.g. if the payment matches the price sum of those items, etc. That is done on the Paima Engine backend.

#### Admin functions

The contract owner has access to these administrative functions:

- `setReferrerRewardBps(uint256 newReferrerRewardBps)`
  - Sets the value of `referrerRewardBps`. This value is defined in basis points, e.g. `100` would mean 100 basis points, meaning 1%. Smallest non-zero value is therefore 1 basis point = 0.01%.
- `setAcceptedPaymentTokens(address[] memory tokens)`
  - Sets the new array of `acceptedPaymentTokens`. For simplicity there are no `add/remove` functions, rather a simple setter for the whole new state array.
- `withdraw(address payable account)`
  - Withdraws the native gas token balance and balances of all `acceptedPaymentTokens` of the contract.
- `transferOwnership(address newOwner)`
  - Inherited from `OwnableUpgradeable` for transferring the ownership of the contract.

### PaimaLaunchpadFactory.sol

Each Paima Launchpad is supposed to have their own contract instance, for clarity. Therefore a `PaimaLaunchpadFactory` contract exists for easy deployment of `PaimaLaunchpad` instances.

`PaimaLaunchpadFactory` inherits the standard `Ownable` contract for access control.

#### Constructor

`constructor(address _launchpadImplementation, address _owner, bool _whitelistDeployersOnly)`

- `_launchpadImplementation` - the address of the deployed Paima Launchpad implementation contract
- `_owner` - the owner of the Paima Launchpad Factory contract
- `_whitelistDeployersOnly` - if true, only whitelisted deployers will be able to deploy new launchpads. Contract owner is automatically added to the whitelisted deployers array.

#### Core functions

The core of the contract functionality is the one function the allowed actors interact with:

- `deploy(address owner, uint256 referrerRewardBps, address[] memory acceptedPaymentTokens)`
  - Deploys and initializes a new launchpad - Deploys an instance of `ERC1967Proxy` contract with implementation pointing to the address stored in `launchpadImplementation`, initializes it with calling `initialize(owner, referrerRewardBps, acceptedPaymentTokens)`
  - Emits a `LaunchpadDeployed` event with the address of the deployed proxy contract
  - If `whitelistDeployersOnly` is true, it reverts if the transaction sender is not a whitelisted deployer

#### Admin functions

The contract owner has access to these administrative functions:

- `setWhitelistDeployersOnly(bool _whitelistDeployersOnly)`
  - Sets `whitelistDeployersOnly` to new boolean value
- `setWhitelistedDeployer(address deployer, bool whitelisted)`
  - Sets the boolean value of `whitelistedDeployers[deployer]`
- `transferOwnership(address newOwner)`
  - Inherited from `Ownable` for transferring the ownership of the contract.

### Deployment process

Deployment process is therefore:

1. Deploy PaimaLaunchpad contract. It has no constructor arguments. This will be used as the implementation contract for the factory.
2. Deploy PaimaLaunchpadFactory contract. In the constructor arguments include the address of the PaimaLaunchpad deployed in the previous step.
3. Use the `deploy` function of the factory to deploy launchpads as necessary. You can read the address of the deployed launchpad in the emitted `LaunchpadDeployed` event.

## Backend

Backend is located in the `backend` folder. Refer to the README file in that folder to get started with development.
