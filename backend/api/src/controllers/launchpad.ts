import { Controller, Get, Query, Route } from 'tsoa';
import type { LaunchpadData } from '@game/utils';
import launchpadsData from '@game/utils/src/data';
import { getAllItemsPurchasedQuantity, requirePool } from '@game/db';

interface GetLaunchpadResponse {
  stats: LaunchpadData | null;
}

@Route('launchpad')
export class LaunchpadController extends Controller {
  @Get()
  public async get(@Query() launchpad: string): Promise<GetLaunchpadResponse> {
    const pool = requirePool();
    const stats = launchpadsData.find(lpad => lpad.slug === launchpad);
    if (!stats) {
      return { stats: null };
    }
    const itemsQuantities = await getAllItemsPurchasedQuantity.run(
      { launchpad: stats.address },
      pool
    );
    for (const lpadItem of stats.items) {
      const item = itemsQuantities.find(i => i.itemid === lpadItem.id);
      lpadItem.purchased = Number(item?.sum ?? 0);
    }
    return { stats };
  }
}
