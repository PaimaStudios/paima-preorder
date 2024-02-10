import { TarochiSaleData } from '@interfaces';
import mongoose from 'mongoose';

const Schema = new mongoose.Schema<TarochiSaleData>({
  key: {
    type: String,
    required: true,
  },
  minted: {
    type: Number,
  },
});

export default mongoose.model<TarochiSaleData>('SaleDataModel', Schema);
