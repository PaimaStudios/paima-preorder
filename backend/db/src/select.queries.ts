/** Types generated for queries found in "src/queries/select.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'GetUser' parameters type */
export interface IGetUserParams {
  launchpad: string;
  wallet: string;
}

/** 'GetUser' return type */
export interface IGetUserResult {
  lastparticipationvalid: boolean;
  lastreferrer: string;
  launchpad: string;
  paymenttoken: string;
  totalamount: string;
  wallet: string;
}

/** 'GetUser' query type */
export interface IGetUserQuery {
  params: IGetUserParams;
  result: IGetUserResult;
}

const getUserIR: any = {"usedParamSet":{"launchpad":true,"wallet":true},"params":[{"name":"launchpad","required":true,"transform":{"type":"scalar"},"locs":[{"a":48,"b":58}]},{"name":"wallet","required":true,"transform":{"type":"scalar"},"locs":[{"a":73,"b":80}]}],"statement":"SELECT * FROM launchpad_users\nWHERE launchpad = :launchpad! AND wallet = :wallet!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM launchpad_users
 * WHERE launchpad = :launchpad! AND wallet = :wallet!
 * ```
 */
export const getUser = new PreparedQuery<IGetUserParams,IGetUserResult>(getUserIR);


/** 'GetParticipations' parameters type */
export interface IGetParticipationsParams {
  launchpad: string;
  wallet: string;
}

/** 'GetParticipations' return type */
export interface IGetParticipationsResult {
  blockheight: number;
  itemids: string;
  itemquantities: string;
  launchpad: string;
  participationvalid: boolean;
  paymentamount: string;
  paymenttoken: string;
  preconditionsmet: boolean;
  referrer: string;
  txhash: string;
  wallet: string;
}

/** 'GetParticipations' query type */
export interface IGetParticipationsQuery {
  params: IGetParticipationsParams;
  result: IGetParticipationsResult;
}

const getParticipationsIR: any = {"usedParamSet":{"launchpad":true,"wallet":true},"params":[{"name":"launchpad","required":true,"transform":{"type":"scalar"},"locs":[{"a":57,"b":67}]},{"name":"wallet","required":true,"transform":{"type":"scalar"},"locs":[{"a":82,"b":89}]}],"statement":"SELECT * FROM launchpad_participations\nWHERE launchpad = :launchpad! AND wallet = :wallet!\nORDER BY blockHeight"};

/**
 * Query generated from SQL:
 * ```
 * SELECT * FROM launchpad_participations
 * WHERE launchpad = :launchpad! AND wallet = :wallet!
 * ORDER BY blockHeight
 * ```
 */
export const getParticipations = new PreparedQuery<IGetParticipationsParams,IGetParticipationsResult>(getParticipationsIR);


/** 'GetParticipatedAmountTotal' parameters type */
export interface IGetParticipatedAmountTotalParams {
  launchpad: string;
  paymentToken: string;
  wallet: string;
}

/** 'GetParticipatedAmountTotal' return type */
export interface IGetParticipatedAmountTotalResult {
  sum: string | null;
}

/** 'GetParticipatedAmountTotal' query type */
export interface IGetParticipatedAmountTotalQuery {
  params: IGetParticipatedAmountTotalParams;
  result: IGetParticipatedAmountTotalResult;
}

const getParticipatedAmountTotalIR: any = {"usedParamSet":{"launchpad":true,"wallet":true,"paymentToken":true},"params":[{"name":"launchpad","required":true,"transform":{"type":"scalar"},"locs":[{"a":83,"b":93}]},{"name":"wallet","required":true,"transform":{"type":"scalar"},"locs":[{"a":108,"b":115}]},{"name":"paymentToken","required":true,"transform":{"type":"scalar"},"locs":[{"a":136,"b":149}]}],"statement":"SELECT SUM(paymentAmount::DECIMAL) FROM launchpad_participations\nWHERE launchpad = :launchpad! AND wallet = :wallet! AND paymentToken = :paymentToken!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT SUM(paymentAmount::DECIMAL) FROM launchpad_participations
 * WHERE launchpad = :launchpad! AND wallet = :wallet! AND paymentToken = :paymentToken!
 * ```
 */
export const getParticipatedAmountTotal = new PreparedQuery<IGetParticipatedAmountTotalParams,IGetParticipatedAmountTotalResult>(getParticipatedAmountTotalIR);


/** 'GetUserItems' parameters type */
export interface IGetUserItemsParams {
  launchpad: string;
  wallet: string;
}

/** 'GetUserItems' return type */
export interface IGetUserItemsResult {
  itemid: number;
  quantity: number;
}

/** 'GetUserItems' query type */
export interface IGetUserItemsQuery {
  params: IGetUserItemsParams;
  result: IGetUserItemsResult;
}

const getUserItemsIR: any = {"usedParamSet":{"launchpad":true,"wallet":true},"params":[{"name":"launchpad","required":true,"transform":{"type":"scalar"},"locs":[{"a":68,"b":78}]},{"name":"wallet","required":true,"transform":{"type":"scalar"},"locs":[{"a":93,"b":100}]}],"statement":"SELECT itemId, quantity FROM launchpad_user_items\nWHERE launchpad = :launchpad! AND wallet = :wallet!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT itemId, quantity FROM launchpad_user_items
 * WHERE launchpad = :launchpad! AND wallet = :wallet!
 * ```
 */
export const getUserItems = new PreparedQuery<IGetUserItemsParams,IGetUserItemsResult>(getUserItemsIR);


/** 'GetItemsPurchasedQuantityExceptUser' parameters type */
export interface IGetItemsPurchasedQuantityExceptUserParams {
  itemId: number;
  launchpad: string;
  wallet: string;
}

/** 'GetItemsPurchasedQuantityExceptUser' return type */
export interface IGetItemsPurchasedQuantityExceptUserResult {
  sum: string | null;
}

/** 'GetItemsPurchasedQuantityExceptUser' query type */
export interface IGetItemsPurchasedQuantityExceptUserQuery {
  params: IGetItemsPurchasedQuantityExceptUserParams;
  result: IGetItemsPurchasedQuantityExceptUserResult;
}

const getItemsPurchasedQuantityExceptUserIR: any = {"usedParamSet":{"launchpad":true,"itemId":true,"wallet":true},"params":[{"name":"launchpad","required":true,"transform":{"type":"scalar"},"locs":[{"a":65,"b":75}]},{"name":"itemId","required":true,"transform":{"type":"scalar"},"locs":[{"a":90,"b":97}]},{"name":"wallet","required":true,"transform":{"type":"scalar"},"locs":[{"a":113,"b":120}]}],"statement":"SELECT SUM(quantity) FROM launchpad_user_items\nWHERE launchpad = :launchpad! AND itemId = :itemId! AND wallet != :wallet!"};

/**
 * Query generated from SQL:
 * ```
 * SELECT SUM(quantity) FROM launchpad_user_items
 * WHERE launchpad = :launchpad! AND itemId = :itemId! AND wallet != :wallet!
 * ```
 */
export const getItemsPurchasedQuantityExceptUser = new PreparedQuery<IGetItemsPurchasedQuantityExceptUserParams,IGetItemsPurchasedQuantityExceptUserResult>(getItemsPurchasedQuantityExceptUserIR);


/** 'GetAllItemsPurchasedQuantity' parameters type */
export interface IGetAllItemsPurchasedQuantityParams {
  launchpad: string;
}

/** 'GetAllItemsPurchasedQuantity' return type */
export interface IGetAllItemsPurchasedQuantityResult {
  itemid: number;
  sum: string | null;
}

/** 'GetAllItemsPurchasedQuantity' query type */
export interface IGetAllItemsPurchasedQuantityQuery {
  params: IGetAllItemsPurchasedQuantityParams;
  result: IGetAllItemsPurchasedQuantityResult;
}

const getAllItemsPurchasedQuantityIR: any = {"usedParamSet":{"launchpad":true},"params":[{"name":"launchpad","required":true,"transform":{"type":"scalar"},"locs":[{"a":73,"b":83}]}],"statement":"SELECT itemId, SUM(quantity) FROM launchpad_user_items\nWHERE launchpad = :launchpad!\nGROUP BY itemId"};

/**
 * Query generated from SQL:
 * ```
 * SELECT itemId, SUM(quantity) FROM launchpad_user_items
 * WHERE launchpad = :launchpad!
 * GROUP BY itemId
 * ```
 */
export const getAllItemsPurchasedQuantity = new PreparedQuery<IGetAllItemsPurchasedQuantityParams,IGetAllItemsPurchasedQuantityResult>(getAllItemsPurchasedQuantityIR);


