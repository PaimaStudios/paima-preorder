import type { SQLUpdate } from '@paima/node-sdk/db';
import type { WalletAddress } from '@paima/sdk/utils';
import type {
  IDeleteUserItemsParams,
  IInsertParticipationParams,
  IInsertUserItemsParams,
  IUpsertUserParams,
  Pool,
} from '@game/db';
import {
  deleteUserItems,
  getItemsPurchasedQuantityExceptUser,
  getParticipatedAmountTotal,
  getUser,
  insertParticipation,
  insertUserItems,
  upsertUser,
} from '@game/db';
import type { BuyItemsInput } from '../types';
import launchpadsData from '@game/utils/src/data';
import { ZERO_ADDRESS, type LaunchpadData } from '@game/utils';

export async function buyItems(params: {
  inputData: BuyItemsInput;
  txHash: string;
  launchpadAddress: string;
  dbConn: Pool;
  blockHeight: number;
}): Promise<SQLUpdate[]> {
  const { inputData, txHash, launchpadAddress, dbConn, blockHeight } = params;
  const launchpadData = launchpadsData.find(
    launchpad => launchpad.address.toLowerCase() === launchpadAddress.toLowerCase()
  );
  if (!launchpadData) {
    console.log('Launchpad not found', launchpadAddress);
    return [];
  }

  // todo: DEFINE CORRECT TIMESTAMP WHEN PAIMA ENGINE IS UPDATED TO SUPPORT IT
  const preconditionsMet = await checkPreconditions({
    inputData,
    launchpadData,
    launchpadAddress,
    dbConn,
    timestamp: blockHeight,
  });
  if (!preconditionsMet) {
    return [
      persistParticipation({
        inputData,
        launchpadAddress,
        txHash,
        blockHeight,
        preconditionsMet,
        participationValid: false,
      }),
    ];
  }

  const [participatedAmountTotal] = await getParticipatedAmountTotal.run(
    {
      launchpad: launchpadAddress,
      wallet: inputData.payload.receiver.toLowerCase(),
      paymentToken: inputData.payload.paymentToken,
    },
    dbConn
  );
  const createUserItemsSqlUpdate = await createUserItems({
    inputData,
    launchpadAddress,
    launchpadData,
    participatedAmountTotal: BigInt(participatedAmountTotal.sum ?? '0'),
    dbConn,
  });
  const participationValid = createUserItemsSqlUpdate !== null;

  let sqlUpdates = [
    persistUser(inputData, launchpadAddress, participationValid),
    persistParticipation({
      inputData,
      launchpadAddress,
      txHash,
      blockHeight,
      preconditionsMet,
      participationValid,
    }),
  ];

  if (createUserItemsSqlUpdate) {
    sqlUpdates = sqlUpdates
      .concat([removeUserItems(inputData.payload.receiver.toLowerCase(), launchpadAddress)])
      .concat(createUserItemsSqlUpdate);
  }
  return sqlUpdates;
}

async function checkPreconditions(params: {
  inputData: BuyItemsInput;
  launchpadData: LaunchpadData;
  launchpadAddress: string;
  dbConn: Pool;
  timestamp: number;
}): Promise<boolean> {
  const { inputData, launchpadData, launchpadAddress, dbConn, timestamp } = params;

  const [user] = await getUser.run(
    { launchpad: launchpadAddress, wallet: inputData.payload.receiver.toLowerCase() },
    dbConn
  );
  if (user && user.paymenttoken !== inputData.payload.paymentToken) {
    console.log(
      `Payment token in event does not match payment token already used by user. Event payment token: ${inputData.payload.paymentToken}, user payment token: ${user.paymenttoken}`
    );
    return false;
  }

  const startSale =
    launchpadData.timestampStartWhitelistSale || launchpadData.timestampStartPublicSale;
  if (timestamp < startSale) {
    console.log(`Block height ${timestamp} is before whitelist sale start ${startSale}`);
    return false;
  } else if (timestamp > launchpadData.timestampEndSale) {
    console.log(`Block height ${timestamp} is after sale end ${launchpadData.timestampEndSale}`);
    return false;
  } else if (
    launchpadData.timestampStartWhitelistSale &&
    launchpadData.whitelistedAddresses &&
    timestamp < launchpadData.timestampStartPublicSale &&
    !launchpadData.whitelistedAddresses.includes(inputData.payload.buyer)
  ) {
    console.log(
      `Block height ${timestamp} is in whitelist sale phase ${launchpadData.timestampStartWhitelistSale}-${launchpadData.timestampStartPublicSale} and ${inputData.payload.buyer} is not whitelisted`
    );
    return false;
  }

  return true;
}

function persistUser(
  inputData: BuyItemsInput,
  launchpadAddress: string,
  participationValid: boolean
): SQLUpdate {
  const params: IUpsertUserParams = {
    stats: {
      launchpad: launchpadAddress,
      paymentToken: inputData.payload.paymentToken,
      totalAmount: inputData.payload.amount,
      lastReferrer: inputData.payload.referrer,
      wallet: inputData.payload.receiver.toLowerCase(),
      participationValid,
    },
  };

  return [upsertUser, params];
}

function persistParticipation(params: {
  inputData: BuyItemsInput;
  launchpadAddress: string;
  txHash: string;
  blockHeight: number;
  preconditionsMet: boolean;
  participationValid: boolean;
}): SQLUpdate {
  const { inputData, launchpadAddress, txHash, blockHeight, preconditionsMet, participationValid } =
    params;
  const insertParams: IInsertParticipationParams = {
    stats: {
      launchpad: launchpadAddress,
      wallet: inputData.payload.receiver.toLowerCase(),
      paymentToken: inputData.payload.paymentToken,
      paymentAmount: inputData.payload.amount,
      referrer: inputData.payload.referrer,
      itemIds: inputData.payload.itemsIds.join(','),
      itemQuantities: inputData.payload.itemsQuantities.join(','),
      preconditionsMet,
      participationValid,
      txHash,
      blockHeight,
    },
  };

  return [insertParticipation, insertParams];
}

function removeUserItems(wallet: WalletAddress, launchpadAddress: string): SQLUpdate {
  const params: IDeleteUserItemsParams = { wallet, launchpad: launchpadAddress };

  return [deleteUserItems, params];
}

async function createUserItems(params: {
  inputData: BuyItemsInput;
  launchpadAddress: string;
  launchpadData: LaunchpadData;
  participatedAmountTotal: bigint;
  dbConn: Pool;
}): Promise<SQLUpdate[] | null> {
  const { inputData, launchpadAddress, launchpadData, participatedAmountTotal, dbConn } = params;
  const { itemsIds, itemsQuantities } = inputData.payload;

  // Check for input errors
  if (itemsIds.length !== itemsQuantities.length || itemsIds.length === 0) {
    return null;
  }

  // Check if there are duplicate items
  if (itemsIds.length !== Array.from(new Set(itemsIds)).length) {
    return null;
  }

  let error: string | null = null;
  let totalCost = 0n;
  let totalFreeItemsValue = 0n;
  for (const [index, itemId] of itemsIds.entries()) {
    const launchpadDataItem = launchpadData.items.find(item => item.id === Number(itemId));
    if (!launchpadDataItem) {
      error = `Item with id ${itemId} not found in launchpad data`;
      break;
    }

    if ('prices' in launchpadDataItem) {
      // Calculate the total cost of the items
      let itemCost = BigInt(launchpadDataItem.prices[inputData.payload.paymentToken]);
      if (inputData.payload.referrer !== ZERO_ADDRESS) {
        const itemReferralDiscountBps =
          launchpadDataItem.referralDiscountBps ?? launchpadData.referralDiscountBps ?? 0;
        itemCost -= (itemCost * BigInt(itemReferralDiscountBps)) / 10000n;
      }
      const itemQuantityCost = itemCost * BigInt(itemsQuantities[index]);
      totalCost += itemQuantityCost;
    } else if ('freeAt' in launchpadDataItem) {
      // Or calculate the total value of free items
      const itemQuantityValue =
        BigInt(launchpadDataItem.freeAt[inputData.payload.paymentToken]) *
        BigInt(itemsQuantities[index]);
      totalFreeItemsValue += itemQuantityValue;
    }

    // Check if the item has a supply
    if (launchpadDataItem.supply !== undefined) {
      const [purchasedQuantityExceptUser] = await getItemsPurchasedQuantityExceptUser.run(
        {
          itemId: Number(itemId),
          launchpad: launchpadAddress,
          wallet: inputData.payload.receiver.toLowerCase(),
        },
        dbConn
      );

      // Check if the purchase exceeds the supply
      if (
        Number(purchasedQuantityExceptUser.sum) + Number(itemsQuantities[index]) >
        launchpadDataItem.supply
      ) {
        error = `Purchase of ${itemsQuantities[index]}x item ${itemId} exceeds the supply of ${launchpadDataItem.supply} (${
          purchasedQuantityExceptUser.sum
        } have already been purchased)`;
        break;
      }
    }
  }
  if (error) {
    console.log(error);
    return null;
  }

  const contributedTotal = participatedAmountTotal + BigInt(inputData.payload.amount);
  if (contributedTotal < totalCost) {
    return null;
  }
  if (totalFreeItemsValue > contributedTotal) {
    return null;
  }

  return itemsIds.map((itemId, index) => {
    const params: IInsertUserItemsParams = {
      stats: {
        launchpad: launchpadAddress,
        wallet: inputData.payload.receiver.toLowerCase(),
        itemId: Number(itemId),
        quantity: Number(itemsQuantities[index]),
      },
    };
    return [insertUserItems, params];
  });
}
