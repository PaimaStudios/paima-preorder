/** Types generated for queries found in "src/queries/delete.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'DeleteUserItems' parameters type */
export interface IDeleteUserItemsParams {
  launchpad: string;
  wallet: string;
}

/** 'DeleteUserItems' return type */
export type IDeleteUserItemsResult = void;

/** 'DeleteUserItems' query type */
export interface IDeleteUserItemsQuery {
  params: IDeleteUserItemsParams;
  result: IDeleteUserItemsResult;
}

const deleteUserItemsIR: any = {"usedParamSet":{"launchpad":true,"wallet":true},"params":[{"name":"launchpad","required":true,"transform":{"type":"scalar"},"locs":[{"a":51,"b":61}]},{"name":"wallet","required":true,"transform":{"type":"scalar"},"locs":[{"a":76,"b":83}]}],"statement":"DELETE FROM launchpad_user_items\nWHERE launchpad = :launchpad! AND wallet = :wallet!"};

/**
 * Query generated from SQL:
 * ```
 * DELETE FROM launchpad_user_items
 * WHERE launchpad = :launchpad! AND wallet = :wallet!
 * ```
 */
export const deleteUserItems = new PreparedQuery<IDeleteUserItemsParams,IDeleteUserItemsResult>(deleteUserItemsIR);


