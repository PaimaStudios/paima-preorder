import { default as BoughtGoldModel } from '@/db/models/BoughtGoldModel';
import { TarochiChain } from '@/interfaces';
import {
  ARB_RPC_URL,
  LAST_SYNCED_BLOCK_SALE_ARB,
  LAST_SYNCED_BLOCK_SALE_XAI,
  NFTS_MAX_SUPPLY,
  NFTS_SOLD_STARTING_POINT,
  TAROCHI_SALE_ADDRESS,
  TGOLD_MAX_PACKS_PURCHASE,
  WHITELIST_END_TIMESTAMP,
  XAI_RPC_URL,
} from '@config';
import { SalePurchasesModel, SyncConfigModel } from '@db';
import { Provider } from '@ethersproject/abstract-provider';
import { TarochiSale } from '@typechain';
import { logger, newContract } from '@utils';
import { BigNumber, Contract, ethers, providers } from 'ethers';

const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';
const genesisPrice: Record<TarochiChain, Record<string, BigNumber>> = {
  xai: {
    [ADDRESS_ZERO]: ethers.utils.parseUnits('23.786869', 18),
  },
  arb: {
    [ADDRESS_ZERO]: ethers.utils.parseUnits('0.008695', 18),
    ['0xaf88d065e77c8cC2239327C5EDb3A432268e5831']: ethers.utils.parseUnits('20', 6),
    ['0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9']: ethers.utils.parseUnits('20', 6),
  },
};
const tgoldPrice: Record<TarochiChain, Record<string, BigNumber>> = {
  xai: {
    [ADDRESS_ZERO]: ethers.utils.parseUnits('1.189344', 18),
  },
  arb: {
    [ADDRESS_ZERO]: ethers.utils.parseUnits('0.000435', 18),
    ['0xaf88d065e77c8cC2239327C5EDb3A432268e5831']: ethers.utils.parseUnits('1', 6),
    ['0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9']: ethers.utils.parseUnits('1', 6),
  },
};
const ARB_START_BLOCK = 178712562;
const ARB_END_BLOCK = 181384000; // approximate is okay
const XAI_START_BLOCK = 436591;
const XAI_END_BLOCK = 1023643; // approximate is okay

class TarochiSaleIndexer {
  public static readonly BUY_EVENT: string = 'BuyNFT';

  public static tarochiSaleArb: TarochiSale;
  public static tarochiSaleXai: TarochiSale;
  public static providerArb: Provider;
  public static providerXai: Provider;

  public static async createAsyncAndRun(): Promise<TarochiSaleIndexer> {
    logger.info(`Initializing Tarochi indexer...`);

    const indexer = new TarochiSaleIndexer();

    TarochiSaleIndexer.tarochiSaleArb = newContract(TAROCHI_SALE_ADDRESS!, ARB_RPC_URL!, 'TarochiSale') as TarochiSale;
    TarochiSaleIndexer.tarochiSaleXai = newContract(TAROCHI_SALE_ADDRESS!, XAI_RPC_URL!, 'TarochiSale') as TarochiSale;

    TarochiSaleIndexer.providerArb = new providers.StaticJsonRpcProvider(ARB_RPC_URL);
    TarochiSaleIndexer.providerXai = new providers.StaticJsonRpcProvider(XAI_RPC_URL);

    // await indexer.syncBlocks();
    await indexer.figureOutMintsRefundsAndTgold();
    // await indexer.startEventListener();

    return indexer;
  }

  private startEventListener() {
    logger.info(`Listening for event ${TarochiSaleIndexer.BUY_EVENT} on Arbitrum`);
    TarochiSaleIndexer.tarochiSaleArb.on(TarochiSaleIndexer.BUY_EVENT, this.arbBuyEventHandler);

    logger.info(`Listening for event ${TarochiSaleIndexer.BUY_EVENT} on Xai`);
    TarochiSaleIndexer.tarochiSaleXai.on(TarochiSaleIndexer.BUY_EVENT, this.xaiBuyEventHandler);
  }

  private async figureOutMintsRefundsAndTgold() {
    try {
      const purchasesSorted = await SalePurchasesModel.find().sort('timestamp');
      logger.info(
        `Purchases sorted ${purchasesSorted[0].timestamp} to ${purchasesSorted[purchasesSorted.length - 1].timestamp}`
      );
      let genesisMintedCounter = NFTS_SOLD_STARTING_POINT;
      let genesisSoldOut = false;
      let genesisSoldOutTimestamp = 0;
      await BoughtGoldModel.deleteMany({});
      logger.info(`Beginning to process ${purchasesSorted.length} purchases...`);
      for (const purchaseDoc of purchasesSorted) {
        const { referrer, chain, paymentToken, price, timestamp } = purchaseDoc;

        purchaseDoc.mintGenesisNft = false;
        purchaseDoc.tgold = 0;

        const priceBN = BigNumber.from(price);
        const genesisPrices = (chain as TarochiChain) === 'arb' ? genesisPrice.arb : genesisPrice.xai;
        let minPriceForGenesis = genesisPrices[paymentToken];
        if (referrer != ADDRESS_ZERO) {
          minPriceForGenesis = minPriceForGenesis.mul(9).div(10);
        }

        let goldPacksBought = 0;
        let priceAfterRefund = priceBN;
        let refundAmount = BigNumber.from(0);

        if (!genesisSoldOut) {
          if (priceBN.gte(minPriceForGenesis)) {
            genesisMintedCounter++;
            purchaseDoc.mintGenesisNft = true;

            goldPacksBought += priceBN.sub(minPriceForGenesis).div(tgoldPrice[chain][paymentToken]).toNumber();

            if (timestamp < WHITELIST_END_TIMESTAMP) {
              goldPacksBought += 2;
            }
          }
        } else {
          if (priceBN.gte(minPriceForGenesis)) {
            if (timestamp <= genesisSoldOutTimestamp + 60 * 60 * 4) {
              refundAmount = minPriceForGenesis;
              priceAfterRefund = priceAfterRefund.sub(refundAmount);
              logger.info(`Refunding, timestamp: ${timestamp} is <= ${genesisSoldOutTimestamp + 60 * 60 * 4}`);
            }
          }
          goldPacksBought += priceAfterRefund.div(tgoldPrice[chain][paymentToken]).toNumber();
        }

        const boughtGoldRec = await BoughtGoldModel.findOne({
          buyer: purchaseDoc.buyer,
          receiver: purchaseDoc.receiver,
        });
        const boughtGoldAlready = boughtGoldRec?.tgold ?? 0;

        purchaseDoc.tgold = Math.min(goldPacksBought, TGOLD_MAX_PACKS_PURCHASE - boughtGoldAlready / 2560) * 2560;
        refundAmount = refundAmount.add(
          tgoldPrice[chain][paymentToken].mul(
            Math.max(0, goldPacksBought - (TGOLD_MAX_PACKS_PURCHASE - boughtGoldAlready / 2560))
          )
        );

        purchaseDoc.refundAmount = refundAmount.toString();
        if (boughtGoldRec) {
          boughtGoldRec.tgold += purchaseDoc.tgold;
          await boughtGoldRec.save();
        } else {
          await BoughtGoldModel.create({
            buyer: purchaseDoc.buyer,
            receiver: purchaseDoc.receiver,
            tgold: purchaseDoc.tgold,
          });
        }

        if (genesisMintedCounter == NFTS_MAX_SUPPLY && !genesisSoldOut) {
          genesisSoldOut = true;
          genesisSoldOutTimestamp = timestamp;
        }

        await purchaseDoc.save();
      }
      logger.info(`Finished updating mintGenesisNft, tgold, and shouldRefund`);
    } catch (err) {
      logger.error(`Failed to figure out mints/refunds/tgold: ${err}`);
    }
  }

  private static async buyEventHandler(
    chain: TarochiChain,
    minPrice: BigNumber,
    receiver: string,
    buyer: string,
    paymentToken: string,
    price: BigNumber,
    tokenId: BigNumber,
    referrer: string,
    event: any
  ) {
    try {
      if (price.lt(tgoldPrice[chain][paymentToken])) {
        logger.info(`Price lower than tgold, ignoring. Tx hash: ${event.transactionHash}`);
        return;
      }
      const provider = chain === 'arb' ? TarochiSaleIndexer.providerArb : TarochiSaleIndexer.providerXai;
      const block = await provider.getBlock(event.blockNumber);
      const saleData = {
        chain,
        receiver,
        buyer,
        paymentToken,
        price,
        tokenId,
        referrer,
        timestamp: block.timestamp,
        block: event.blockNumber,
      };
      if (!!(await SalePurchasesModel.exists(saleData))) {
        logger.info(`Record already exists, skipping. Buyer ${saleData.buyer} at ${block.timestamp}`);
      } else {
        await SalePurchasesModel.create(saleData);
        logger.info(`${chain} Season Pass sold at ${block.timestamp}, block ${event.blockNumber}.`);
      }
    } catch (err) {
      logger.error(`Failed to respond to event ${JSON.stringify(event)}: ${err}`);
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
    await TarochiSaleIndexer.buyEventHandler(
      'arb',
      minPrice,
      receiver,
      buyer,
      paymentToken,
      price,
      tokenId,
      referrer,
      event
    );
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
    await TarochiSaleIndexer.buyEventHandler(
      'xai',
      minPrice,
      receiver,
      buyer,
      paymentToken,
      price,
      tokenId,
      referrer,
      event
    );
  }

  public async syncBlocks() {
    const tarochiSaleAddress = TarochiSaleIndexer.tarochiSaleArb.address;
    let syncConfigFilter = { key: LAST_SYNCED_BLOCK_SALE_ARB, contract: tarochiSaleAddress };
    let syncConfig = await SyncConfigModel.findOne(syncConfigFilter);

    let latestBlockNumber = ARB_END_BLOCK;

    let lastProcessedBlockNumber = syncConfig == null ? ARB_START_BLOCK : Number(syncConfig?.lastSyncedBlock);

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
      TarochiSaleIndexer.BUY_EVENT,
      lastProcessedBlockNumber,
      latestBlockNumber,
      TarochiSaleIndexer.tarochiSaleArb
    );
    log(numberOfBlocksSynced, TarochiSaleIndexer.BUY_EVENT);

    syncConfigFilter = { key: LAST_SYNCED_BLOCK_SALE_XAI, contract: tarochiSaleAddress };
    syncConfig = await SyncConfigModel.findOne(syncConfigFilter);
    lastProcessedBlockNumber = syncConfig == null ? XAI_START_BLOCK : Number(syncConfig?.lastSyncedBlock);
    latestBlockNumber = XAI_END_BLOCK;

    logger.info(
      `Syncing TarochiSale contract on Xai. From block #${lastProcessedBlockNumber} to #${latestBlockNumber} for ${tarochiSaleAddress}`
    );

    // Sync for `BuyEvent` events
    numberOfBlocksSynced = await this.syncSingleEvent(
      'xai',
      TarochiSaleIndexer.BUY_EVENT,
      lastProcessedBlockNumber,
      latestBlockNumber,
      TarochiSaleIndexer.tarochiSaleXai
    );
    log(numberOfBlocksSynced, TarochiSaleIndexer.BUY_EVENT);
  }

  private async syncSingleEvent(
    chain: TarochiChain,
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

  private async parseEventsAndUpdateIdentity(
    chain: TarochiChain,
    pastEvents: any[],
    eventName: string
  ): Promise<number> {
    let blocksSynced = 0;

    if (pastEvents.length) {
      for (const event of pastEvents) {
        if (event.args) {
          switch (eventName) {
            case TarochiSaleIndexer.BUY_EVENT: {
              const { receiver, buyer, paymentToken, price, tokenId, referrer } = event.args;

              await Promise.all([
                chain === 'arb'
                  ? this.arbBuyEventHandler(receiver, buyer, paymentToken, price, tokenId, referrer, event)
                  : this.xaiBuyEventHandler(receiver, buyer, paymentToken, price, tokenId, referrer, event),
                TarochiSaleIndexer.updateSyncConfig(event.blockNumber, {
                  key: chain === 'arb' ? LAST_SYNCED_BLOCK_SALE_ARB : LAST_SYNCED_BLOCK_SALE_XAI,
                  contract: TarochiSaleIndexer.tarochiSaleArb.address,
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

export default TarochiSaleIndexer;
