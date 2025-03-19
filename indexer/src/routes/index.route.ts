import RestAPIController from '@controller/index.controller';
import { logger } from '@utils';
import { Router } from 'express';
import validator from 'express-joi-validation';
import V1Route from './v1.route';

class Routes extends V1Route {
  public router = Router();
  public restApiController: RestAPIController;

  constructor() {
    super();
    this.restApiController = new RestAPIController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    logger.info(`Initializing routes with path ${this.path}`);
    const queryValidator = validator.createValidator();

    this.router.get(`${this.path}/tarochi`, this.restApiController.getTarochiSaleData.bind(this.restApiController));
  }
}

export default Routes;
