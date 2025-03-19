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

1. Deploy `PaimaLaunchpad` contract. It has no constructor arguments. This will be used as the implementation contract for the factory.
2. Deploy `PaimaLaunchpadFactory` contract. In the constructor arguments include the address of the PaimaLaunchpad deployed in the previous step.
3. Use the `deploy` function of the factory to deploy launchpads as necessary. You can read the address of the deployed launchpad in the emitted `LaunchpadDeployed` event.

## Backend

Backend is located in the `backend` folder. Refer to the README file in that folder to get started with development.

### Configuration

All data about launchpad (that concerns the backend) is stored in the `backend/utils/src/data.ts` file. That includes data such as the launchpad's sale phases timestamps, the items for sale and their prices, possible free rewards and the amounts they are free at, whitelisted addresses, and so on. This data is what the backend validates an on-chain purchase against.

### Overview

Backend is built with Paima Engine. It listens for the `LaunchpadDeployed` event on the `PaimaLaunchpadFactory` contract to have a list of dynamic EVM primitives (instances of `PaimaLaunchpad` proxy contracts deployed with the factory) to track. It listens for the `BuyItems` event on these primitives. This is configured in the `extensions.yml` file.

When the `BuyItems` event is emitted by the contract on-chain, the backend will catch it and it will start to process it in the State Transition Module. The processing has multiple steps:

1. Preconditions are checked. This includes:
   1. If the user has already had a successful purchase (their user record exists), check if the payment token used now matches the payment token saved. - This is done so that currencies are not mixed - a system design choice.
   1. Check the current time against the sale timestamps - check if sale has started, if sale has not ended.
   1. If the sale has a whitelist phase (whitelist timestamp defined), and the sale is currently in this phase, check if the user is in the whitelisted addresses list.
1. If the preconditions check failed, a participation record is stored into the database and the processing **ends here**. A participation record is a record of the intent of the purchase, containing all input data and other information such as the current blockHeight, transaction hash, and others.
1. Otherwise, the total amount of all the previous participations of the user is loaded from the database.
1. User items IDs and quantities input data is validated. This includes:
   1. Validate that the `itemsIds` array length equals the `itemsQuantities` array length
   1. Validate that there are no duplicate IDs in the `itemsIds` array - makes it easy to not make doublespend errors.
   1. If any of the selected item has a limited supply, validate that the purchase does not exceed the limited supply.
   1. Calculate the total contributed amount of the user = the current payment amount together with the sum of amounts of all the previous participations of this user.
   1. Calculate the total items price cost. Validate that the total contributed amount of the user is at least the total items price cost. In other words, validate that the user does not claim more items than what they have paid for.
   1. Calculate the sum of 'free at' price points of the free rewards. Validate that the total contributed amount of the user is at least the sum of the 'free at' price points of the free rewards. In other words, validate that the user does not claim more free rewards than what they are eligible for.
1. If the items validation failed, the participation is deemed invalid, and only a user record and a participation record are stored in the database and the processing **ends here**. A user record contains most notably the payment token used, the total amount contributed (of participations that passed the preconditions check), and boolean flag if the last participation was valid.
1. Otherwise, a user record, a participation record, and user items records are stored in the database. A user item record is a record that stores information about the user's final claim of a launchpad's item. There is a user item record per each individual item ID.

### API

When you're running the Paima Engine node, an API with various endpoints is exposed. This API is then used by the frontend, and can be also used manually for things like determining the final list of purchased items by users, or the list of eligible refunds.

The API is located in the `backend/api` folder, with the available routes specified by the controllers in `backend/api/src/controllers/`.

#### API Endpoints

- `/launchpads`
  - Returns an array of launchpad information defined in the `backend/utils/src/data.ts` file.
  - Used by the frontend to show a list of available launchpads on the launchpads landing page.
- `/launchpad?launchpad=<slug>`
  - Returns the information about launchpad specified by the `slug`, as defined in the `backend/utils/src/data.ts` file. The information from the file is extended with the real-time information about the currently purchased amounts of each item (so that the frontend can handle limited-supply items).
  - Used by the frontend to show information on the specific launchpad page.
- `/userData?launchpad=<slug>&wallet=[address]`
  - `wallet` is optional
  - If `wallet` is specified, returns the user record and the user items records of the specified `wallet` pertaining to the launchpad specified by the `slug`.
  - If `wallet` is not specified, returns all the user items records pertaining to the launchpad specified by the `slug`.
  - Used by the frontend to show the already placed order of the user, and to limit the choice of the payment token if one was already used.
  - Used manually without the `wallet` parameter by the launchpad administrator to get the list of the launchpad result for items distribution.
- `/refunds?launchpad=<slug>&wallet=[address]`
  - `wallet` is optional
  - If `wallet` is specified, returns the list of eligible refunds of the specified `wallet` pertaining to the launchpad specified by the `slug`.
  - If `wallet` is not specified, returns all the eligible refunds pertaining to the launchpad specified by the `slug`.
  - Eligible refunds are:
    - Participations that failed the preconditions check (incorrect time, incorrect payment token, user not on whitelist)
    - Participations that passed the preconditions check, but were deemed invalid (invalid items selection, payment doesn't match the items selection, bought out-of-stock limited-supply items, etc.) AND happened after the last valid participation of the user (meaning the user **did not** subsequently correct them with any valid participation)
  - Used maunally by the launchpad administrator to get the list of refunds to make.
- `/participations?launchpad=<slug>&wallet=<address>`

  - Returns the array of participations of the specified `wallet` pertaining to the launchpad specified by the `slug`.
  - Not actively used but the complete log of a user might come in handy in some dispute resolution.

## Frontend

Frontend is a part of the [Paima Asset Portal repository](https://github.com/PaimaStudios/paima-portal).
