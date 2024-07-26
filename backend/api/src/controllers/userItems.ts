import { Controller, Get, Query, Route } from 'tsoa';
import { requirePool, getUserItems } from '@game/db';
import type { UserItemsStats } from '@game/utils';

interface GetUserItemsResponse {
  stats: UserItemsStats[];
}

@Route('userItems')
export class UserItemsController extends Controller {
  @Get()
  public async get(
    @Query() launchpad: string,
    @Query() wallet: string
  ): Promise<GetUserItemsResponse> {
    const pool = requirePool();
    wallet = wallet.toLowerCase();
    const stats = await getUserItems.run({ launchpad, wallet }, pool);
    return { stats };
  }
}
