import { TarochiSale__factory } from '@typechain';
import { Contract, providers } from 'ethers';

export const newContract = (address: string, rpcURL: string, name: string): Contract | undefined => {
  switch (name) {
    case 'TarochiSale':
      return TarochiSale__factory.connect(address, new providers.StaticJsonRpcProvider(rpcURL));
    default:
      throw new Error(`Unknown contract ${name}`);
  }
};
