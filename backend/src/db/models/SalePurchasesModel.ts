import { TarochiSalePurchase } from '@interfaces';
import mongoose from 'mongoose';

const Schema = new mongoose.Schema<TarochiSalePurchase>({
  chain: {
    type: String,
  },
  price: {
    type: String,
  },
  paymentToken: {
    type: String,
  },
  buyer: {
    type: String,
  },
  receiver: {
    type: String,
  },
  referrer: {
    type: String,
  },
  tokenId: {
    type: Number,
  },
  block: {
    type: Number,
  },
  timestamp: {
    type: Number,
  },
  shouldRefund: {
    type: Boolean,
  },
  mintGenesisNft: {
    type: Boolean,
  },
  tgold: {
    type: Number,
  },
});

export default mongoose.model<TarochiSalePurchase>('SalePurchasesModel', Schema);
