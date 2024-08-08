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


/** 'GetRefunds' parameters type */
export interface IGetRefundsParams {
  launchpad: string;
  wallet?: string | null | void;
}

/** 'GetRefunds' return type */
export interface IGetRefundsResult {
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

/** 'GetRefunds' query type */
export interface IGetRefundsQuery {
  params: IGetRefundsParams;
  result: IGetRefundsResult;
}

const getRefundsIR: any = {"usedParamSet":{"launchpad":true,"wallet":true},"params":[{"name":"launchpad","required":true,"transform":{"type":"scalar"},"locs":[{"a":155,"b":165},{"a":667,"b":677}]},{"name":"wallet","required":false,"transform":{"type":"scalar"},"locs":[{"a":210,"b":216},{"a":244,"b":250},{"a":688,"b":694},{"a":725,"b":731}]}],"statement":"WITH LastValidParticipation AS (\n  SELECT\n    wallet,\n    MAX(blockHeight) AS last_valid_block\n  FROM\n    launchpad_participations\n  WHERE\n    launchpad = :launchpad!\n    AND participationValid = TRUE\n    AND (:wallet::TEXT IS NULL OR wallet = :wallet)\n  GROUP BY\n    wallet\n),\nInvalidParticipations AS (\n  SELECT\n    lp.wallet,\n    lp.launchpad,\n    lp.paymentToken,\n    lp.paymentAmount,\n    lp.referrer,\n    lp.itemIds,\n    lp.itemQuantities,\n    lp.txHash,\n    lp.blockHeight,\n    lp.preconditionsMet,\n    lp.participationValid\n  FROM\n    launchpad_participations lp\n  LEFT JOIN\n    LastValidParticipation lvp ON lp.wallet = lvp.wallet\n  WHERE\n    lp.launchpad = :launchpad!\n    AND (:wallet::TEXT IS NULL OR lp.wallet = :wallet)\n    AND (\n      (lp.blockHeight > lvp.last_valid_block\n      AND lp.preconditionsMet = TRUE\n      AND lp.participationValid = FALSE)\n      OR\n      (lp.preconditionsMet = FALSE)\n    )\n)\nSELECT\n  wallet,\n  launchpad, paymentToken, paymentAmount, referrer, itemIds, itemQuantities, txHash, blockHeight, preconditionsMet, participationValid\nFROM\n  InvalidParticipations\nORDER BY wallet, blockHeight"};

/**
 * Query generated from SQL:
 * ```
 * WITH LastValidParticipation AS (
 *   SELECT
 *     wallet,
 *     MAX(blockHeight) AS last_valid_block
 *   FROM
 *     launchpad_participations
 *   WHERE
 *     launchpad = :launchpad!
 *     AND participationValid = TRUE
 *     AND (:wallet::TEXT IS NULL OR wallet = :wallet)
 *   GROUP BY
 *     wallet
 * ),
 * InvalidParticipations AS (
 *   SELECT
 *     lp.wallet,
 *     lp.launchpad,
 *     lp.paymentToken,
 *     lp.paymentAmount,
 *     lp.referrer,
 *     lp.itemIds,
 *     lp.itemQuantities,
 *     lp.txHash,
 *     lp.blockHeight,
 *     lp.preconditionsMet,
 *     lp.participationValid
 *   FROM
 *     launchpad_participations lp
 *   LEFT JOIN
 *     LastValidParticipation lvp ON lp.wallet = lvp.wallet
 *   WHERE
 *     lp.launchpad = :launchpad!
 *     AND (:wallet::TEXT IS NULL OR lp.wallet = :wallet)
 *     AND (
 *       (lp.blockHeight > lvp.last_valid_block
 *       AND lp.preconditionsMet = TRUE
 *       AND lp.participationValid = FALSE)
 *       OR
 *       (lp.preconditionsMet = FALSE)
 *     )
 * )
 * SELECT
 *   wallet,
 *   launchpad, paymentToken, paymentAmount, referrer, itemIds, itemQuantities, txHash, blockHeight, preconditionsMet, participationValid
 * FROM
 *   InvalidParticipations
 * ORDER BY wallet, blockHeight
 * ```
 */
export const getRefunds = new PreparedQuery<IGetRefundsParams,IGetRefundsResult>(getRefundsIR);


