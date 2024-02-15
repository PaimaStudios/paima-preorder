import { SyncConfigModel } from '@interfaces';
import mongoose from 'mongoose';

const Schema = new mongoose.Schema<SyncConfigModel>(
  {
    lastSyncedBlock: {
      type: Number,
      required: true,
    },
    contract: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<SyncConfigModel>('SyncConfigModel', Schema);
