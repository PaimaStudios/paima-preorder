import { SaleAggregatedDataModel, SalePurchasesModel, SyncConfigModel, db } from '@db';

(async () => {
  await db();

  console.log('Deleting all SyncConfigModel docs...');
  await SyncConfigModel.deleteMany({});

  console.log('Deleting all SaleAggregatedDataModel docs...');
  await SaleAggregatedDataModel.deleteMany({});

  console.log('Deleting all SalePurchasesModel docs...');
  await SalePurchasesModel.deleteMany({});
})();
