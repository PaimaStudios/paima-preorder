import { LOG_FORMAT, PORT } from '@/config';
import { Routes } from '@interfaces';
import errorMiddleware from '@middlewares/error.middleware';
import { logger, stream } from '@utils';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor(port?: number) {
    this.app = express();
    this.env = process.env.NODE_ENV!;
    this.port = port || Number(PORT);
  }

  public startApp(routes: Routes[]): express.server {
    this.initializeMiddlewares();
    const server = this.listen(routes);

    this.initializeErrorHandling();

    return server;
  }

  private listen(routes: Routes[]) {
    this.initializeRoutes(routes);

    const server = this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });

    return server;
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach((route) => {
      this.app.use('/', route.router);
    });
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;
