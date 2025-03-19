# Smart contracts

## Overview

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

### Legacy contracts

#### TarochiSeasonPassNft.sol

Forked from `@paima/evm-contracts` `AnnotatedMintNft.sol`. Updated solidity version and implemented minting deadline.

#### TarochiSale.sol

Created by combining `NativeNftSale.sol` and `Erc20NftSale.sol` from `@paima/evm-contracts` to facilitate the ability to pay with both native tokens and ERC20 tokens and add referral system.  
It implements UUPS proxy pattern and is used via OpenZeppelin's ERC1967Proxy.

## Preparing for usage

1. Install Foundry by following the instructions from [their repository](https://github.com/foundry-rs/foundry#installation).
2. Copy the `.env.template` file to `.env` and fill in the variables.
3. Install the dependencies by running: `yarn`

## Compiling smart contracts

```bash
yarn compile
```

## Running local chain and deploying to it

```bash
yarn anvil
yarn deploy:localhost
```

## Deploying to testnet or mainnet

### Paima Launchpad contracts

**Before deploying, make sure you have set the correct values for `DEPLOYMENT_CONTRACT_OWNER_ADDRESS` and `DEPLOYMENT_LAUNCHPAD_WHITELIST_ONLY` variables in `.env`!**

```bash
yarn deploy:launchpad:localhost
yarn deploy:launchpad:testnet
yarn deploy:launchpad:mainnet
```

Deploying to mainnet will automatically verify the smart contracts on the chain's explorer (if `ETHERSCAN_API_KEY` env variable is properly populated). To disable this, remove the `--verify` argument from the script.

### Legacy contracts

Legacy contracts for Tarochi launchpad stuff.

**Before deploying, make sure you have set the correct values for `DEPLOYMENT_` variables in `.env`! Edit `script/Deploy.s.sol` if you wish to change the NFT name or symbol.**

Forge will deploy the contract at a deterministic address due to specified salt in the `Deploy.s.sol` script, using [deterministic deployment proxy](https://github.com/Arachnid/deterministic-deployment-proxy). Ensure that the proxy (0x4e59b44847b379578588920ca78fbf26c0b4956c) is deployed on the chain you're deploying to.  
Also note that constructor args must also be the same. If you use different constructor args on different chains, the resulting deployment address will differ too.

Deploying to mainnets will automatically verify the smart contracts on the respective chains' explorers. To disable this, remove the `--verify` argument from the script.

```bash
yarn deploy:xai:testnet
yarn deploy:xai:mainnet
yarn deploy:arb:testnet
yarn deploy:arb:mainnet
```
