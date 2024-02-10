import { SaleDataModel } from '@db';
import { Pagination, TarochiSaleData } from '@interfaces';

class ControllerService {
  constructor() {}

  public async fetchTarochiSaleData(): Promise<TarochiSaleData | null> {
    const baseRewardsRate = (await SaleDataModel.find().limit(1))[0];
    return baseRewardsRate;
  }

  public static paginate<T>(size: number, page: number, items: any[]): Pagination<T> {
    if (items.length) {
      const end: number = (Number(page) + 1) * size;
      const start: number = end - size;

      const sliceItems = items.slice(start, end);
      const totalItems = items.length;
      const totalPages = Math.ceil(totalItems / size);
      const currentPage = page;

      return {
        totalItems,
        totalPages,
        currentPage,
        result: sliceItems,
      };
    }

    return {
      totalItems: 0,
      totalPages: 0,
      currentPage: 0,
      result: [],
    };
  }
}

export default ControllerService;
