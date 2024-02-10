import { logger } from '@utils';
import ShinkaiRegistryIndexer from './contracts/registry.service';

class Indexer {
  public static async createAsyncAndRun(): Promise<Indexer> {
    logger.info(`Initializing indexer service...`);

    const indexer = new Indexer();
    await ShinkaiRegistryIndexer.createAsyncAndRun();

    return indexer;
  }
}

export default Indexer;
