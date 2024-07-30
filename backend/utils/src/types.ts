import type { IGetParticipationsResult, IGetUserResult, IGetUserItemsResult } from '@game/db';

type CommonItemProps = {
  id: string;
  name: string;
  description: string;
  image?: string;
};

type StandardItem = CommonItemProps & {
  // Map of token address to price of the item
  prices: Record<string, string>;
  // Referral discount override to the price of the item, expressed in basis points
  referralDiscountBps?: number;
};

type FreeRewardItem = CommonItemProps & {
  // Map of token address to amount per which the item is able to be claimed for free
  freeAt: Record<string, string>;
};

type ItemType = StandardItem | FreeRewardItem;

export type LaunchpadData = {
  id: string;
  name: string;
  // URL-friendly slug of the name
  slug: string;
  // Game description displayed in the launchpads list
  description: string;
  image?: string;
  items: ItemType[];
  // Default referral discount to the prices of items, expressed in basis points
  referralDiscountBps?: number;
};

export type UserStats = IGetUserResult;

export type ParticipationsStats = IGetParticipationsResult;

export type UserItemsStats = IGetUserItemsResult;

export type UserDataStats = {
  user: UserStats;
  items: UserItemsStats[];
};
