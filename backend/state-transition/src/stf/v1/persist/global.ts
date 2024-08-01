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
      persistParticipation({ inputData, launchpadAddress, txHash, blockHeight, preconditionsMet }),
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
  const createUserItemsSqlUpdate = createUserItems(
    inputData,
    launchpadAddress,
    launchpadData,
    BigInt(participatedAmountTotal.sum ?? '0')
  );
  const participationValid = createUserItemsSqlUpdate !== null;

  let sqlUpdates = [
    persistUser(inputData, launchpadAddress, participationValid),
    persistParticipation({ inputData, launchpadAddress, txHash, blockHeight, preconditionsMet }),
    removeUserItems(inputData.payload.receiver.toLowerCase(), launchpadAddress),
  ];

  if (createUserItemsSqlUpdate) {
    sqlUpdates = sqlUpdates.concat(createUserItemsSqlUpdate);
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
}): SQLUpdate {
  const { inputData, launchpadAddress, txHash, blockHeight, preconditionsMet } = params;
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

function createUserItems(
  inputData: BuyItemsInput,
  launchpadAddress: string,
  launchpadData: LaunchpadData,
  participatedAmountTotal: bigint
): SQLUpdate[] | null {
  const { itemsIds, itemsQuantities } = inputData.payload;
  if (itemsIds.length !== itemsQuantities.length || itemsIds.length === 0) {
    return null;
  }

  let error: string | null = null;
  let totalCost = 0n;
  let totalFreeItemsValue = 0n;
  itemsIds.forEach((itemId, index) => {
    const launchpadDataItem = launchpadData.items.find(item => item.id === Number(itemId));
    if (!launchpadDataItem) {
      error = `Item with id ${itemId} not found in launchpad data`;
      return;
    }
    if ('prices' in launchpadDataItem) {
      let itemCost = BigInt(launchpadDataItem.prices[inputData.payload.paymentToken]);
      if (inputData.payload.referrer !== ZERO_ADDRESS) {
        const itemReferralDiscountBps =
          launchpadDataItem.referralDiscountBps ?? launchpadData.referralDiscountBps ?? 0;
        itemCost -= (itemCost * BigInt(itemReferralDiscountBps)) / 10000n;
      }
      const itemQuantityCost = itemCost * BigInt(itemsQuantities[index]);
      totalCost += itemQuantityCost;
    } else if ('freeAt' in launchpadDataItem) {
      const itemQuantityValue =
        BigInt(launchpadDataItem.freeAt[inputData.payload.paymentToken]) *
        BigInt(itemsQuantities[index]);
      totalFreeItemsValue += itemQuantityValue;
    }
  });
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
