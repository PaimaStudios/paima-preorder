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
    for (const item of itemsQuantities) {
      const lpadItem = stats.items.find(i => i.id === item.itemid);
      if (lpadItem) {
        lpadItem.purchased = Number(item.sum);
      }
    }
    return { stats };
  }
}
