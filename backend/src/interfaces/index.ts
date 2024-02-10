import { Router } from 'express';

export interface IndexedString {
  _isIndexed: boolean;
  hash: string;
}
export interface TarochiSaleData {
  key: string;
  minted: number;
  block: number;
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
