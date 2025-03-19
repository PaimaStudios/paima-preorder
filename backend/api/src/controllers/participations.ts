import { Controller, Get, Query, Route } from 'tsoa';
import { requirePool, getParticipations } from '@game/db';
import type { ParticipationsStats } from '@game/utils';
import launchpadsData from '@game/utils/src/data';

interface GetParticipationsResponse {
  stats: ParticipationsStats[];
}

@Route('participations')
export class ParticipationsController extends Controller {
  @Get()
  public async get(
    @Query() launchpad: string,
    @Query() wallet: string
  ): Promise<GetParticipationsResponse> {
    const pool = requirePool();
    wallet = wallet.toLowerCase();
    const launchpadAddress = launchpadsData.find(lpad => lpad.slug === launchpad)?.address;
    const stats = launchpadAddress
      ? await getParticipations.run({ launchpad: launchpadAddress, wallet }, pool)
      : [];
    return { stats };
  }
}
