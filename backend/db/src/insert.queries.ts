/** Types generated for queries found in "src/queries/insert.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'UpsertUser' parameters type */
export interface IUpsertUserParams {
  stats: {
    launchpad: string,
    wallet: string,
    paymentToken: string,
    totalAmount: string,
    lastReferrer: string,
    participationValid: boolean
  };
}

/** 'UpsertUser' return type */
export type IUpsertUserResult = void;

/** 'UpsertUser' query type */
export interface IUpsertUserQuery {
  params: IUpsertUserParams;
  result: IUpsertUserResult;
}

const upsertUserIR: any = {"usedParamSet":{"stats":true},"params":[{"name":"stats","required":false,"transform":{"type":"pick_tuple","keys":[{"name":"launchpad","required":true},{"name":"wallet","required":true},{"name":"paymentToken","required":true},{"name":"totalAmount","required":true},{"name":"lastReferrer","required":true},{"name":"participationValid","required":true}]},"locs":[{"a":35,"b":40}]}],"statement":"INSERT INTO launchpad_users\nVALUES :stats\nON CONFLICT (launchpad, wallet)\nDO UPDATE SET\nparticipationValid = EXCLUDED.participationValid, lastReferrer = EXCLUDED.lastReferrer, totalAmount = (launchpad_users.totalAmount::DECIMAL + EXCLUDED.totalAmount::DECIMAL)::TEXT"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO launchpad_users
 * VALUES :stats
 * ON CONFLICT (launchpad, wallet)
 * DO UPDATE SET
 * participationValid = EXCLUDED.participationValid, lastReferrer = EXCLUDED.lastReferrer, totalAmount = (launchpad_users.totalAmount::DECIMAL + EXCLUDED.totalAmount::DECIMAL)::TEXT
 * ```
 */
export const upsertUser = new PreparedQuery<IUpsertUserParams,IUpsertUserResult>(upsertUserIR);


/** 'InsertParticipation' parameters type */
export interface IInsertParticipationParams {
  stats: {
    launchpad: string,
    wallet: string,
    paymentToken: string,
    paymentAmount: string,
    referrer: string,
    itemIds: string,
    itemQuantities: string,
    txHash: string,
    blockHeight: number,
    preconditionsMet: boolean,
    participationValid: boolean
  };
}

/** 'InsertParticipation' return type */
export type IInsertParticipationResult = void;

/** 'InsertParticipation' query type */
export interface IInsertParticipationQuery {
  params: IInsertParticipationParams;
  result: IInsertParticipationResult;
}

const insertParticipationIR: any = {"usedParamSet":{"stats":true},"params":[{"name":"stats","required":false,"transform":{"type":"pick_tuple","keys":[{"name":"launchpad","required":true},{"name":"wallet","required":true},{"name":"paymentToken","required":true},{"name":"paymentAmount","required":true},{"name":"referrer","required":true},{"name":"itemIds","required":true},{"name":"itemQuantities","required":true},{"name":"txHash","required":true},{"name":"blockHeight","required":true},{"name":"preconditionsMet","required":true},{"name":"participationValid","required":true}]},"locs":[{"a":44,"b":49}]}],"statement":"INSERT INTO launchpad_participations\nVALUES :stats\nON CONFLICT\nDO NOTHING"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO launchpad_participations
 * VALUES :stats
 * ON CONFLICT
 * DO NOTHING
 * ```
 */
export const insertParticipation = new PreparedQuery<IInsertParticipationParams,IInsertParticipationResult>(insertParticipationIR);


/** 'InsertUserItems' parameters type */
export interface IInsertUserItemsParams {
  stats: {
    launchpad: string,
    wallet: string,
    itemId: number,
    quantity: number
  };
}

/** 'InsertUserItems' return type */
export type IInsertUserItemsResult = void;

/** 'InsertUserItems' query type */
export interface IInsertUserItemsQuery {
  params: IInsertUserItemsParams;
  result: IInsertUserItemsResult;
}

const insertUserItemsIR: any = {"usedParamSet":{"stats":true},"params":[{"name":"stats","required":false,"transform":{"type":"pick_tuple","keys":[{"name":"launchpad","required":true},{"name":"wallet","required":true},{"name":"itemId","required":true},{"name":"quantity","required":true}]},"locs":[{"a":40,"b":45}]}],"statement":"INSERT INTO launchpad_user_items\nVALUES :stats\nON CONFLICT\nDO NOTHING"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO launchpad_user_items
 * VALUES :stats
 * ON CONFLICT
 * DO NOTHING
 * ```
 */
export const insertUserItems = new PreparedQuery<IInsertUserItemsParams,IInsertUserItemsResult>(insertUserItemsIR);


