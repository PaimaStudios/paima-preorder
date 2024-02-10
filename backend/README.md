# tarochi-sale-backend

A backend service indexing Buy events in the Shinkai smart contracts and providing APIs to be consumed by the Shinkai dApp.

The following events are indexed:

- [ShinkaiRegistry.sol](https://github.com/dcSpark/shinkai-contracts/blob/main/src/ShinkaiRegistry.sol): `IdentityClaim`, `IdentityUnclaim`, `StakeUpdate`, `KeysUpdate`, `AddressOrProxyNodesUpdate`, `DelegationsUpdate`
- [ShinkaiNFT.sol](https://github.com/dcSpark/shinkai-contracts/blob/main/src/ShinkaiNFT.sol): `Transfer`

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

#### GET identities

```http
GET /api/v1/shinkai/identities?owner=<owner>&filter=<filter>&size=<size>&page=<page>
```

| Parameter | Type      | Description                                 |
| :-------- | :-------- | :------------------------------------------ |
| `account` | `string`  | **optional**. The account address           |
| `filter`  | `string`  | **optional**. Identity substring to filter  |
| `size`    | `integer` | **optional**. Size of response. Default = 5 |
| `page`    | `integer` | **optional**. Response page. Default = 0    |

##### Sample GET all identities

###### Request:

```http
GET /api/v1/shinkai/identities
```

###### Response:

```javascript
{
    "data": {
        "totalItems": 3,
        "totalPages": 1,
        "currentPage": 0,
        "result": [
            {
                "_id": "65256f18ea704150429798c2",
                "identityRaw": "amazon.shinkai",
            },
            {
                "_id": "65256f18ea704150429798b9",
                "identityRaw": "matej2.shinkai",
            },
            {
                "_id": "65256f18ea704150429798b3",
                "identityRaw": "matej.shinkai",
            }
        ]
    }
}
```

##### Sample GET identities of owner

###### Request:

```http
GET /api/v1/shinkai/identities?owner=0x1946a1DD383FE3c3cd9ae3066C638EF6ed7E35e5
```

###### Response:

```javascript
{
    "data": {
        "totalItems": 2,
        "totalPages": 1,
        "currentPage": 0,
        "result": [
            {
                "_id": "65256f18ea704150429798c2",
                "identityRaw": "amazon.shinkai",
            },
            {
                "_id": "65256f18ea704150429798b3",
                "identityRaw": "matej.shinkai",
            }
        ]
    }
}
```

##### Sample GET identities that match a substring

###### Request:

```http
GET /api/v1/shinkai/identities?filter=matej
```

###### Response:

```javascript
{
    "data": {
        "totalItems": 2,
        "totalPages": 1,
        "currentPage": 0,
        "result": [
            {
                "_id": "65256f18ea704150429798b9",
                "identityRaw": "matej2.shinkai",
            },
            {
                "_id": "65256f18ea704150429798b3",
                "identityRaw": "matej.shinkai",
            }
        ]
    }
}
```

#### GET identity by identity name+namespace

```http
GET /api/v1/shinkai/identity?identity=<identity>
```

| Parameter  | Type     | Description                                   |
| :--------- | :------- | :-------------------------------------------- |
| `identity` | `string` | **required**. The identity (name + namespace) |

##### Sample Request:

```http
GET /api/v1/shinkai/identity?identity=matej.shinkai
```

##### Sample Response:

```javascript
{
    "data": {
        "_id": "65256f18ea704150429798b3",
        "identity": "0xb71d1d221b0d1bfff2844a4bc5c23fab07f434193bed1a1bb427082ce27c1d87",
        "identityRaw": "matej.shinkai",
        "addressOrProxyNodes": [
            "matej2.shinkai",
            "amazon.shinkai"
        ],
        "routing": true,
        "nftTokenId": 1,
        "createdAt": 4546261,
        "updatedAt": 4546285,
        "__v": 0,
        "delegations": [
            {
                "delegatee": "matej2.shinkai",
                "amount": "10000000000000000000",
                "_id": "653b89196717c93ff002f24c"
            },
            {
                "delegatee": "matej3.shinkai",
                "amount": "1000000000000000000",
                "_id": "653b89196717c93ff002f24d"
            }
        ],
        "stakedTokens": "50000000000000000000",
        "encryptionKey": "f2185d5472769bedf735dbcd304f7eb569928ab684cf34c6681b214caf55a466",
        "signatureKey": "8f3e46bcde4c44eb7899f4eee85c4919d429e2001997712bd5435956f777387d",
        "delegatedTokens": "10000000000000000000",
        "owner": "0x1946a1DD383FE3c3cd9ae3066C638EF6ed7E35e5"
    }
}
```

#### GET base rewards rate

```http
GET /api/v1/shinkai/base-rewards-rate
```

##### Sample Response:

```javascript
{
    "data": {
        "_id": "6537c74b847d27e23a6a6032",
        "block": 4552654,
        "baseRewardsRate": "19025875190",
        "__v": 0
    }
}
```

#### GET rewards claim history

```http
GET /api/v1/shinkai/claim-history?identity=<identity>&types[]=<type>&size=<size>&page=<page>
```

| Parameter  | Type      | Description                                                |
| :--------- | :-------- | :--------------------------------------------------------- |
| `identity` | `string`  | **required**. The identity (name + namespace)              |
| `types[]`  | `string`  | **optional**. Filter claim types `Staking` or `Delegation` |
| `size`     | `integer` | **optional**. Size of response. Default = 5                |
| `page`     | `integer` | **optional**. Response page. Default = 0                   |

##### Sample Request:

```http
GET /api/v1/shinkai/claim-history?identity=matej.shinkai&types[]=Staking
```

##### Sample Response:

```javascript
{
    "data": {
        "totalItems": 6,
        "totalPages": 2,
        "currentPage": 0,
        "result": [
            {
                "_id": "65435a0de0d5acf3dff49f08",
                "block": 4613624,
                "type": "Staking",
                "identityRaw": "matej.shinkai",
                "amount": "91878995432540400",
                "__v": 0
            },
            {
                "_id": "653bac2ce0d5acf3dff49e50",
                "block": 4573381,
                "type": "Staking",
                "identityRaw": "matej.shinkai",
                "amount": "1446156773191900",
                "__v": 0
            },
            {
                "_id": "653ba726e0d5acf3dff49de1",
                "block": 4572690,
                "type": "Staking",
                "identityRaw": "matej.shinkai",
                "amount": "10213089801992000",
                "__v": 0
            },
            {
                "_id": "653ba726e0d5acf3dff49dd3",
                "block": 4567322,
                "type": "Staking",
                "identityRaw": "matej.shinkai",
                "amount": "2386605783833600",
                "__v": 0
            },
            {
                "_id": "653ba726e0d5acf3dff49dc1",
                "block": 4565754,
                "type": "Staking",
                "identityRaw": "matej.shinkai",
                "amount": "179604261793600",
                "__v": 0
            }
        ]
    }
}
```

#### GET profile

```http
GET /api/v1/shinkai/profile?owner=<owner>
```

| Parameter | Type     | Description                    |
| :-------- | :------- | :----------------------------- |
| `owner`   | `string` | **required**. The user address |

##### Sample Request:

```http
GET /api/v1/shinkai/profile?owner=0x1946a1DD383FE3c3cd9ae3066C638EF6ed7E35e5
```

##### Sample Response:

```javascript
{
    "data": {
        "owner": "0x1946a1DD383FE3c3cd9ae3066C638EF6ed7E35e5",
        "stakedTokens": "199000000000000000000"
    }
}
```
