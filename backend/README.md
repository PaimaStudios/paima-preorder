# tarochi-sale-backend

A backend service indexing Buy events in the Tarochi Sale smart contract. Primary purpose is to build a database of accounts that are supposed to be airdropped the Genesis Trainer NFT, of accounts that are supposed to be refunded, and of the amount of TGOLD to be airdropped to Genesis Trainer+ buyers.

There is also an API that was used to monitor Genesis NFTs "minted" before they were sold out. It will now report inaccurate data, don't use it for anything, there's no point.

The following events are indexed:

- [TarochiSale.sol](https://github.com/PaimaStudios/paima-preorder/blob/main/contracts/src/TarochiSale.sol): `BuyNFT`

## Setup

#### Prerequisites

- Install mongo DB and having it running.
- This service requires a node version` >= 16.13.0`.

Create `.env.development` or `.env.production` file based on the template `.env.template` - and ensure `NODE_ENV` is set to `development` or `production`.

Run the indexer in development mode:

```
$  yarn gen-abi-types
$  yarn dev
```

Run the indexer in production mode:

```
$  yarn start
```

## API

#### GET data

###### Request:

```http
GET /api/v1/tarochi
```

###### Response:

```javascript
{
    "data": [
        {
            "_id": "65c7e860bf18134b8c76a22e",
            "key": "arb",
            "minted": 4667,
            "block": 179452080,
            "__v": 0
        },
        {
            "_id": "65c7e904bf18134b8c77187b",
            "key": "xai",
            "minted": 1748,
            "block": 511441,
            "__v": 0
        }
    ]
}
```
