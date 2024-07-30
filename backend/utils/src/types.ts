import type { IGetParticipationsResult, IGetUserResult, IGetUserItemsResult } from '@game/db';

type CommonItemProps = {
  /**
   * Item ID that will be also emitted in the events
   */
  id: `${number}`;
  /**
   * Item name to be displayed on the frontend
   */
  name: string;
  /**
   * Item description displayed in the frontend
   */
  description: string;
  /**
   * Optional URL to the image displayed in the frontend
   */
  image?: string;
};

type StandardItem = CommonItemProps & {
  /**
   * Map of payment token identifier (address) to price of the item
   */
  prices: Record<string, string>;
  /**
   * Optional override of the referral discount to the price of the item, expressed in basis points
   */
  referralDiscountBps?: number;
};

type FreeRewardItem = CommonItemProps & {
  /**
   * Map of payment token identifier (address) to amount per which the item is able to be claimed for free
   */
  freeAt: Record<string, string>;
};

type ItemType = StandardItem | FreeRewardItem;

export type LaunchpadData = {
  /**
   * Launchpad ID, preferably its contract address
   */
  id: string;
  /**
   * Launchpad name to be displayed on the frontend
   */
  name: string;
  /**
   * URL-friendly slug of the name
   */
  slug: string;
  /**
   * Game description displayed in the launchpads list
   */
  description: string;
  /**
   * URL to the image displayed in the launchpads list
   */
  image?: string;
  /**
   * List of items available for purchase in the launchpad
   */
  items: ItemType[];
  /**
   * UNIX timestamp of the start of the whitelist sale, in seconds
   */
  timestampStartWhitelistSale: number;
  /**
   * UNIX timestamp of the start of the public sale, in seconds
   */
  timestampStartPublicSale: number;
  /**
   * UNIX timestamp of the end of the sale, in seconds
   */
  timestampEndSale: number;
  /**
   * Default referral discount to the prices of items, expressed in basis points
   */
  referralDiscountBps?: number;
  /**
   * List of curated packages of items (basically just a shortcut to add multiple items to the cart)
   */
  curatedPackages?: {
    /**
     * Package name to be displayed on the frontend
     */
    name: string;
    /**
     * Optional package description displayed in the frontend, if omitted the enumeration of package items will be displayed
     */
    description?: string;
    /**
     * List of items that are part of the package
     */
    items: {
      /**
       * Item ID corresponding to the `items` array
       */
      id: `${number}`;
      /**
       * Quantity of the item in the package
       */
      quantity: number;
    }[];
  }[];
};

export type UserStats = IGetUserResult;

export type ParticipationsStats = IGetParticipationsResult;

export type UserItemsStats = IGetUserItemsResult;

export type UserDataStats = {
  user: UserStats;
  items: UserItemsStats[];
};
