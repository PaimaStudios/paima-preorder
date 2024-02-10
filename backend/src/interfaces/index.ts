import { Router } from 'express';

export interface IndexedString {
  _isIndexed: boolean;
  hash: string;
}

export interface Delegation {
  delegatee: string;
  amount: string;
}

export interface TarochiSaleData {
  key: string;
  minted: number;
}

export interface BaseRewardsRate {
  block: number;
  baseRewardsRate: string;
}

export interface ClaimHistory {
  block: number;
  type: string;
  identityRaw: string;
  amount: string;
}

export interface Profile {
  owner: string;
  stakedTokens: string;
}

export interface SyncConfigModel {
  lastSyncedBlock: number;
  key: string;
  contract: string;
}

export interface Routes {
  path?: string;
  router: Router;
}

export interface Pagination<T> {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  result: T[];
}
