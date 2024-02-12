import { TarochiSaleAggregatedData } from '@interfaces';
import mongoose from 'mongoose';

const Schema = new mongoose.Schema<TarochiSaleAggregatedData>({
  key: {
    type: String,
    required: true,
  },
  minted: {
    type: Number,
  },
  block: {
    type: Number,
  },
});

export default mongoose.model<TarochiSaleAggregatedData>('SaleAggregatedDataModel', Schema);
