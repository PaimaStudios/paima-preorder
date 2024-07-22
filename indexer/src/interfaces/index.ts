import { Router } from 'express';

export type TarochiChain = 'arb' | 'xai';

export interface IndexedString {
  _isIndexed: boolean;
  hash: string;
}
export interface TarochiSaleAggregatedData {
  key: string;
  minted: number;
  block: number;
}

export interface TarochiSalePurchase {
  chain: string;
  price: string;
  paymentToken: string;
  buyer: string;
  receiver: string;
  referrer: string;
  tokenId: number;
  block: number;
  timestamp: number;
  refundAmount: string;
  mintGenesisNft: boolean;
  tgold: number;
}

export interface TarochiBoughtGold {
  buyer: string;
  receiver: string;
  tgold: number;
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
