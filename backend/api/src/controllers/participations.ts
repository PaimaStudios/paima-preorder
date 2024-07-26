import { Controller, Get, Query, Route } from 'tsoa';
import { requirePool, getParticipations } from '@game/db';
import type { ParticipationsStats } from '@game/utils';

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
    const stats = await getParticipations.run({ launchpad, wallet }, pool);
    return { stats };
  }
}
