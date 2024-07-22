import { cleanEnv, port, str } from 'envalid';

export const validateEnv = () => {
  cleanEnv(process.env, {
    MONGODB_URL: str(),
    LOG_FORMAT: str(),
    LOG_DIR: str(),
    TAROCHI_SALE_ADDRESS: str(),
    XAI_RPC_URL: str(),
    ARB_RPC_URL: str(),
    PORT: port(),
  });
};
