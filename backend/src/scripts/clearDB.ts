import BoughtGoldModel from '@/db/models/BoughtGoldModel';
import { SaleAggregatedDataModel, SalePurchasesModel, SyncConfigModel, db } from '@db';

(async () => {
  await db();

  console.log('Deleting all SyncConfigModel docs...');
  await SyncConfigModel.deleteMany({});

  console.log('Deleting all SaleAggregatedDataModel docs...');
  await SaleAggregatedDataModel.deleteMany({});

  console.log('Deleting all SalePurchasesModel docs...');
  await SalePurchasesModel.deleteMany({});

  console.log('Deleting all BoughtGoldModel docs...');
  await BoughtGoldModel.deleteMany({});
})();
