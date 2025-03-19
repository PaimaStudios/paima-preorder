import * as dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

export const { MONGODB_URL, LOG_FORMAT, LOG_DIR, XAI_RPC_URL, ARB_RPC_URL, PORT, TAROCHI_SALE_ADDRESS } = process.env;
