import { Controller, Get, Query, Route } from 'tsoa';
import { requirePool, getUser } from '@game/db';
import type { UserStats } from '@game/utils';

interface GetUserResponse {
  stats: UserStats;
}

@Route('user')
export class UserController extends Controller {
  @Get()
  public async get(@Query() launchpad: string, @Query() wallet: string): Promise<GetUserResponse> {
    const pool = requirePool();
    wallet = wallet.toLowerCase();
    const [stats] = await getUser.run({ launchpad, wallet }, pool);
    return { stats };
  }
}
