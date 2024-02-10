import { MONGODB_URL } from '@config';
import { logger } from '@utils';
import mongoose from 'mongoose';

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

if (process.env.NODE_ENV === 'development') {
  mongoose.set('debug', false);
}

export default async (opts = options) => {
  if (mongoose.connection.readyState === 1) return;
  if (mongoose.connection.readyState === 0) {
    mongoose
      .connect(MONGODB_URL!, {
        serverSelectionTimeoutMS: 5000,
      })
      .catch((err) => console.log(err.reason));
  }
};

mongoose.connection.on('connected', async () => {
  logger.debug('Connected to mongodb');
});

mongoose.connection.on('error', (e) => {
  logger.error(e.message);
});

mongoose.connection.on('disconnected', () => {
  logger.info('Disconnected from mongodb');
});
