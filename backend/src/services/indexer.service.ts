import { logger } from '@utils';
import TarochiSaleIndexer from './contracts/registry.service';

class Indexer {
  public static async createAsyncAndRun(): Promise<Indexer> {
    logger.info(`Initializing indexer service...`);

    const indexer = new Indexer();
    await TarochiSaleIndexer.createAsyncAndRun();

    return indexer;
  }
}

export default Indexer;
