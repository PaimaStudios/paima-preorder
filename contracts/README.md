# Tarochi Season Pass contracts

## Contracts

### TarochiSeasonPassNft.sol

Forked from `@paima/evm-contracts` `AnnotatedMintNft.sol`. Updated solidity version and implemented minting deadline.

### TarochiSale.sol

Created by combining `NativeNftSale.sol` and `Erc20NftSale.sol` from `@paima/evm-contracts` to facilitate the ability to pay with both native tokens and ERC20 tokens and add referral system.  
It implements UUPS proxy pattern and is used via OpenZeppelin's ERC1967Proxy.

### Preparing for usage

1. Install Foundry by following the instructions from [their repository](https://github.com/foundry-rs/foundry#installation).
2. Copy the `.env.template` file to `.env` and fill in the variables.
3. Install the dependencies by running: `yarn`

### Compiling smart contracts

```bash
yarn compile
```

### Running local chain and deploying to it

```bash
yarn anvil
yarn deploy:localhost
```

### Deploying to testnet or mainnet

**Before deploying, edit `script/DeployArbMainnet.s.sol` (and/or respective deployment scripts) with the appropriate values for the deployment chain!** Particularly the `nftNativePrice`, `nftErc20Price`, and `supportedCurrencies`.

Forge will deploy the contract at a deterministic address due to specified salt in the `Deploy.s.sol` script, using [deterministic deployment proxy](https://github.com/Arachnid/deterministic-deployment-proxy). Ensure that the proxy (0x4e59b44847b379578588920ca78fbf26c0b4956c) is deployed on the chain you're deploying to.  
Also note that constructor args must also be the same. If you use different constructor args on different chains, the resulting deployment address will differ too.

Deploying to mainnets will automatically verify the smart contracts on the respective chains' explorers. To disable this, remove the `--verify` argument from the script.

```bash
yarn deploy:xai:testnet
yarn deploy:xai:mainnet
yarn deploy:arb:testnet
yarn deploy:arb:mainnet
```
