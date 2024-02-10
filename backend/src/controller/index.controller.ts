import ControllerService from '@services/controller.service';
import { NextFunction, Request, Response } from 'express';

const SIZE_DEFAULT = 5;
const PAGE_DEFAULT = 0;
class RestAPIController {
  public service: ControllerService;

  constructor() {
    this.service = new ControllerService();
  }

  public async getTarochiSaleData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await this.service.fetchTarochiSaleData();
      return res.status(200).json({
        data,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default RestAPIController;
