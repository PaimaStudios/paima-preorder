import { Controller, Get, Query, Route } from 'tsoa';
import { requirePool, getUserItems, getUser } from '@game/db';
import type { UserDataStats } from '@game/utils';
import launchpadsData from '@game/utils/src/data';

interface GetUserDataResponse {
  stats: UserDataStats | null;
}

@Route('userData')
export class UserDataController extends Controller {
  @Get()
  public async get(
    @Query() launchpad: string,
    @Query() wallet?: string
  ): Promise<GetUserDataResponse> {
    const pool = requirePool();
    const launchpadAddress = launchpadsData.find(lpad => lpad.slug === launchpad)?.address;
    if (!launchpadAddress) {
      return { stats: null };
    }
    const items = await getUserItems.run(
      { launchpad: launchpadAddress, wallet: wallet?.toLowerCase() ?? null },
      pool
    );
    const [user] = wallet
      ? await getUser.run({ launchpad: launchpadAddress, wallet: wallet.toLowerCase() }, pool)
      : [undefined];
    return {
      stats: {
        items,
        user,
      },
    };
  }
}
