import { SaleDataModel, SyncConfigModel, db } from '@db';

(async () => {
  await db();

  console.log('Deleting all SyncConfigModel docs...');
  await SyncConfigModel.deleteMany({});

  console.log('Deleting all SaleDataModel docs...');
  await SaleDataModel.deleteMany({});
})();
