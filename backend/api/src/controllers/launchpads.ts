import { Controller, Get, Route } from 'tsoa';
import type { LaunchpadData } from '@game/utils';
import launchpadsData from '@game/utils/src/data';

interface GetLaunchpadsResponse {
  stats: LaunchpadData[];
}

@Route('launchpads')
export class LaunchpadsController extends Controller {
  @Get()
  public async get(): Promise<GetLaunchpadsResponse> {
    const stats = launchpadsData;
    return { stats };
  }
}
