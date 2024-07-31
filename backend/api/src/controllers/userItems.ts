import { Controller, Get, Query, Route } from 'tsoa';
import { requirePool, getUserItems } from '@game/db';
import type { UserItemsStats } from '@game/utils';
import launchpadsData from '@game/utils/src/data';

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
    const launchpadAddress = launchpadsData.find(lpad => lpad.slug === launchpad)?.address;
    const stats = launchpadAddress
      ? await getUserItems.run({ launchpad: launchpadAddress, wallet }, pool)
      : [];
    return { stats };
  }
}
