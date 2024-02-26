import { TarochiBoughtGold } from '@interfaces';
import mongoose from 'mongoose';

const Schema = new mongoose.Schema<TarochiBoughtGold>({
  buyer: {
    type: String,
  },
  receiver: {
    type: String,
  },
  tgold: {
    type: Number,
  },
});

export default mongoose.model<TarochiBoughtGold>('BoughtGoldModel', Schema);
