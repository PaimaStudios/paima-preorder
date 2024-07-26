import { Controller, Get, Query, Route } from 'tsoa';
import { requirePool, getUserItems, getUser } from '@game/db';
import type { UserDataStats } from '@game/utils';

interface GetUserDataResponse {
  stats: UserDataStats;
}

@Route('userData')
export class UserDataController extends Controller {
  @Get()
  public async get(
    @Query() launchpad: string,
    @Query() wallet: string
  ): Promise<GetUserDataResponse> {
    const pool = requirePool();
    wallet = wallet.toLowerCase();
    const items = await getUserItems.run({ launchpad, wallet }, pool);
    const [user] = await getUser.run({ launchpad, wallet }, pool);
    return {
      stats: {
        items,
        user,
      },
    };
  }
}
