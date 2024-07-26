import type { IGetParticipationsResult, IGetUserResult, IGetUserItemsResult } from '@game/db';

export type LaunchpadData = {
  id: string;
  name: string;
  items: {
    id: string;
    name: string;
    prices: Record<string, string>;
  }[];
};

export type UserStats = IGetUserResult;

export type ParticipationsStats = IGetParticipationsResult;

export type UserItemsStats = IGetUserItemsResult;

export type UserDataStats = {
  user: UserStats;
  items: UserItemsStats[];
};
