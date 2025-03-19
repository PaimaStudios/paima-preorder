import { db } from '@db';
import Routes from '@routes/index.route';
import Indexer from '@services/indexer.service';
import { logger, validateEnv } from '@utils';
import App from './app';

const MAX_ATTEMPTS = 3;
let currentAttempt = 1;

export default async function main(): Promise<void> {
  logger.info('Validating environment variables...');

  validateEnv();
  await db();

  // Start indexer service
  await Indexer.createAsyncAndRun();

  // Setup the REST API and start the server
  const app = new App();
  app.startApp([new Routes()]);
}

async function tryMain() {
  try {
    logger.info(`Attempt #${currentAttempt}.`);
    await main();
    logger.info('Starting indexer and server...');
    currentAttempt = 1;
  } catch (err) {
    console.log(`Something went wrong ${err}`);
    currentAttempt++;
    if (currentAttempt <= MAX_ATTEMPTS) {
      await tryMain();
    } else {
      throw 'x';
    }
  }
}

tryMain().catch((err) => {
  console.log(`Failed after ${MAX_ATTEMPTS} attempts, shutting down.`);
  throw 'xx';
});
