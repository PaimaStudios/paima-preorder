import { TarochiSaleData } from '@/interfaces';
import {
  ARB_RPC_URL,
  LAST_SYNCED_BLOCK_SALE_ARB,
  LAST_SYNCED_BLOCK_SALE_XAI,
  TAROCHI_SALE_ADDRESS,
  XAI_RPC_URL,
} from '@config';
import { SaleDataModel, SyncConfigModel } from '@db';
import { Provider } from '@ethersproject/abstract-provider';
import { TarochiSale } from '@typechain';
import { logger, newContract } from '@utils';
import { BigNumber, Contract, ethers, providers } from 'ethers';

const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';
const genesisPrice = {
  xai: {
    [ADDRESS_ZERO]: ethers.utils.parseUnits('23.786869', 18),
  },
  arb: {
    [ADDRESS_ZERO]: ethers.utils.parseUnits('0.008695', 18),
    ['0xaf88d065e77c8cC2239327C5EDb3A432268e5831']: ethers.utils.parseUnits('20', 6),
    ['0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9']: ethers.utils.parseUnits('20', 6),
  },
};
const ARB_START_BLOCK = 178712562;
const XAI_START_BLOCK = 436591;

class ShinkaiRegistryIndexer {
  public static readonly BUY_EVENT: string = 'BuyNFT';

  public static tarochiSaleArb: TarochiSale;
  public static tarochiSaleXai: TarochiSale;
  public static providerArb: Provider;
  public static providerXai: Provider;

  public static async createAsyncAndRun(): Promise<ShinkaiRegistryIndexer> {
    logger.info(`Initializing Tarochi indexer...`);

    const indexer = new ShinkaiRegistryIndexer();

    ShinkaiRegistryIndexer.tarochiSaleArb = newContract(
      TAROCHI_SALE_ADDRESS!,
      ARB_RPC_URL!,
      'TarochiSale'
    ) as TarochiSale;
    ShinkaiRegistryIndexer.tarochiSaleXai = newContract(
      TAROCHI_SALE_ADDRESS!,
      XAI_RPC_URL!,
      'TarochiSale'
    ) as TarochiSale;

    ShinkaiRegistryIndexer.providerArb = new providers.StaticJsonRpcProvider(ARB_RPC_URL);
    ShinkaiRegistryIndexer.providerXai = new providers.StaticJsonRpcProvider(XAI_RPC_URL);

    await indexer.syncBlocks();
    await indexer.startEventListener();

    return indexer;
  }

  private startEventListener() {
    logger.info(`Listening for event ${ShinkaiRegistryIndexer.BUY_EVENT} on Arbitrum`);
    ShinkaiRegistryIndexer.tarochiSaleArb.on(ShinkaiRegistryIndexer.BUY_EVENT, this.arbBuyEventHandler);

    logger.info(`Listening for event ${ShinkaiRegistryIndexer.BUY_EVENT} on Xai`);
    ShinkaiRegistryIndexer.tarochiSaleXai.on(ShinkaiRegistryIndexer.BUY_EVENT, this.xaiBuyEventHandler);
  }

  private async buyEventHandler(chain: string, minPrice: BigNumber, price: BigNumber, event: any) {
    try {
      if (price.lt(minPrice)) {
        return;
      }
      await ShinkaiRegistryIndexer.incrementMintedSaleData(chain, event.blockNumber);
    } catch (err) {
      logger.error(`Failed to respond to event ${event}: ${err}`);
    }
  }

  private async arbBuyEventHandler(
    receiver: string,
    buyer: string,
    paymentToken: string,
    price: BigNumber,
    tokenId: BigNumber,
    referrer: string,
    event: any
  ) {
    let minPrice = genesisPrice.arb[paymentToken] as BigNumber;
    if (referrer != ADDRESS_ZERO) {
      minPrice = minPrice.mul(9).div(10);
    }
    if (minPrice == null) {
      logger.info(`Arbitrum minprice not found! ${paymentToken} ${price}`);
      return;
    }
    await this.buyEventHandler('arb', minPrice, price, event);
  }

  private async xaiBuyEventHandler(
    receiver: string,
    buyer: string,
    paymentToken: string,
    price: BigNumber,
    tokenId: BigNumber,
    referrer: string,
    event: any
  ) {
    let minPrice = genesisPrice.xai[paymentToken] as BigNumber;
    if (referrer != ADDRESS_ZERO) {
      minPrice = minPrice.mul(9).div(10);
    }
    if (minPrice == null) {
      logger.info(`Xai minprice not found! ${paymentToken} ${price}`);
      return;
    }
    await this.buyEventHandler('xai', minPrice, price, event);
  }

  private static async incrementMintedSaleData(chain: string, block: number) {
    try {
      const existingData = await SaleDataModel.findOne({ key: chain });
      const newMinted = (existingData?.minted ?? 0) + 1;
      const update: TarochiSaleData = { key: chain, minted: newMinted, block };
      if (existingData) {
        await SaleDataModel.findOneAndUpdate({ key: chain }, update);
      } else {
        await SaleDataModel.create(update);
      }
      logger.info(`Sale data update: New minted count: ${newMinted}`);
    } catch (err) {
      throw err;
    }
  }

  public async syncBlocks() {
    const tarochiSaleAddress = ShinkaiRegistryIndexer.tarochiSaleArb.address;
    let syncConfigFilter = { key: LAST_SYNCED_BLOCK_SALE_ARB, contract: tarochiSaleAddress };
    let syncConfig = await SyncConfigModel.findOne(syncConfigFilter);

    let latestBlockNumber = await ShinkaiRegistryIndexer.providerArb.getBlockNumber();

    let lastProcessedBlockNumber = syncConfig == null ? ARB_START_BLOCK : Number(syncConfig?.lastSyncedBlock) + 1;

    logger.info(
      `Syncing TarochiSale contract on Arb. From block #${lastProcessedBlockNumber} to #${latestBlockNumber} for ${tarochiSaleAddress}`
    );

    const log = (blocks, event) => {
      blocks == 0
        ? logger.info(`Skipped syncing ${event} events. ${event} events up to date...`)
        : logger.info(`Synced ${blocks} block(s) for ${event} event...`);
    };

    // Sync for `BuyEvent` events
    let numberOfBlocksSynced = await this.syncSingleEvent(
      'arb',
      ShinkaiRegistryIndexer.BUY_EVENT,
      lastProcessedBlockNumber,
      latestBlockNumber,
      ShinkaiRegistryIndexer.tarochiSaleArb
    );
    log(numberOfBlocksSynced, ShinkaiRegistryIndexer.BUY_EVENT);

    syncConfigFilter = { key: LAST_SYNCED_BLOCK_SALE_XAI, contract: tarochiSaleAddress };
    syncConfig = await SyncConfigModel.findOne(syncConfigFilter);
    lastProcessedBlockNumber = syncConfig == null ? XAI_START_BLOCK : Number(syncConfig?.lastSyncedBlock) + 1;
    latestBlockNumber = await ShinkaiRegistryIndexer.providerXai.getBlockNumber();

    logger.info(
      `Syncing TarochiSale contract on Xai. From block #${lastProcessedBlockNumber} to #${latestBlockNumber} for ${tarochiSaleAddress}`
    );

    // Sync for `BuyEvent` events
    numberOfBlocksSynced = await this.syncSingleEvent(
      'xai',
      ShinkaiRegistryIndexer.BUY_EVENT,
      lastProcessedBlockNumber,
      latestBlockNumber,
      ShinkaiRegistryIndexer.tarochiSaleXai
    );
    log(numberOfBlocksSynced, ShinkaiRegistryIndexer.BUY_EVENT);
  }

  private async syncSingleEvent(
    chain: string,
    eventName: string,
    lastProcessedBlockNumber: number,
    latestBlockNumber: number,
    contract: Contract
  ): Promise<number> {
    let eventFilter = contract.filters[eventName]();

    let start = lastProcessedBlockNumber;
    let numberOfBlocksSynced = 0;
    while (start < latestBlockNumber) {
      let end = start + 1000;
      logger.info(`Syncing ${eventName} on ${chain}. From block #${start} to #${end}`);
      let pastEvents = await contract.queryFilter(eventFilter, start, end);
      numberOfBlocksSynced += await this.parseEventsAndUpdateIdentity(chain, pastEvents, eventName);
      start = end;
    }

    return numberOfBlocksSynced;
  }

  private async parseEventsAndUpdateIdentity(chain: string, pastEvents: any[], eventName: string): Promise<number> {
    let blocksSynced = 0;

    if (pastEvents.length) {
      for (const event of pastEvents) {
        if (event.args) {
          switch (eventName) {
            case ShinkaiRegistryIndexer.BUY_EVENT: {
              const { receiver, buyer, paymentToken, price, tokenId, referrer } = event.args;

              await Promise.all([
                chain === 'arb'
                  ? this.arbBuyEventHandler(receiver, buyer, paymentToken, price, tokenId, referrer, event)
                  : this.xaiBuyEventHandler(receiver, buyer, paymentToken, price, tokenId, referrer, event),
                ShinkaiRegistryIndexer.updateSyncConfig(event.blockNumber, {
                  key: chain === 'arb' ? LAST_SYNCED_BLOCK_SALE_ARB : LAST_SYNCED_BLOCK_SALE_XAI,
                  contract: ShinkaiRegistryIndexer.tarochiSaleArb.address,
                }),
              ]);

              break;
            }
          }
          blocksSynced += 1;
        }
      }
    }

    return blocksSynced;
  }

  private static async updateSyncConfig(lastSyncedBlock: number, filter: { key: string; contract: string }) {
    let prev: number;
    const syncConfig = await SyncConfigModel.findOne(filter);

    if (syncConfig) {
      prev = syncConfig.lastSyncedBlock;
      if (lastSyncedBlock <= prev) {
        return;
      }
      await SyncConfigModel.findOneAndUpdate(filter, { lastSyncedBlock });
    } else {
      await SyncConfigModel.create({ key: filter.key, contract: filter.contract, lastSyncedBlock });
      prev = 0;
    }

    logger.info(`Updated sync config ${filter.key} from ${prev} to ${lastSyncedBlock}. For ${filter.contract}`);
  }
}

export default ShinkaiRegistryIndexer;
