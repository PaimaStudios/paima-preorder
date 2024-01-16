# Tarochi Season Pass contracts

### Preparing for usage

1. Install Foundry by following the instructions from [their repository](https://github.com/foundry-rs/foundry#installation).
2. Copy the `.env.template` file to `.env` and fill in the variables.
3. Install the dependencies by running: `yarn`

### Compiling smart contracts

```bash
yarn compile
yarn compile:sizes (to see contracts sizes)
```

### Running local chain and deploying to it

```bash
yarn anvil
yarn deploy:localhost
```

### Deploying to testnet or mainnet

Forge will deploy the contract at a deterministic address due to specified salt in the `Deploy.s.sol` script, using [deterministic deployment proxy](https://github.com/Arachnid/deterministic-deployment-proxy). Ensure that the proxy (0x4e59b44847b379578588920ca78fbf26c0b4956c) is deployed on the chain you're deploying to.  
Also note that constructor args must also be the same. If you use different constructor args on different chains, the resulting deployment address will differ too.

Deploying to mainnets will automatically verify the smart contracts on the respective chains' explorers. To disable this, remove the `--verify` argument from the script.

```bash
yarn deploy:xai:testnet
yarn deploy:xai:mainnet
```
