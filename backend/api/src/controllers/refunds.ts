import { Controller, Get, Query, Route } from 'tsoa';
import { requirePool, getRefunds } from '@game/db';
import type { RefundsStats } from '@game/utils';
import launchpadsData from '@game/utils/src/data';

interface GetRefundsResponse {
  stats: RefundsStats[];
}

@Route('refunds')
export class RefundsController extends Controller {
  @Get()
  public async get(
    @Query() launchpad: string,
    @Query() wallet?: string
  ): Promise<GetRefundsResponse> {
    const pool = requirePool();
    const launchpadAddress = launchpadsData.find(lpad => lpad.slug === launchpad)?.address;
    const stats = launchpadAddress
      ? await getRefunds.run({ launchpad: launchpadAddress, wallet: wallet ?? null }, pool)
      : [];
    return { stats };
  }
}
