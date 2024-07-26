import { ZERO_ADDRESS } from '.';
import type { LaunchpadData } from './types';

const launchpadsData: LaunchpadData[] = [
  {
    id: '0xCafac3dD18aC6c6e92c921884f9E4176737C052c',
    name: 'Test Launchpad 1',
    referralDiscountBps: 100,
    items: [
      {
        id: '1',
        name: 'Item A',
        prices: {
          [ZERO_ADDRESS]: '10000000000000',
          '0xusdc': '34681800000000000',
        },
        referralDiscountBps: 500,
      },
      {
        id: '2',
        name: 'Item B',
        prices: {
          [ZERO_ADDRESS]: '20000000000000',
          '0xusdc': '69363600000000000',
        },
      },
      {
        id: '100',
        name: 'Free Item X',
        freeAt: {
          [ZERO_ADDRESS]: '100000000000000',
          '0xusdc': '346818000000000000',
        },
      },
    ],
  },
  {
    id: '0x9f1ac54BEF0DD2f6f3462EA0fa94fC62300d3a8e',
    name: 'Test Launchpad 2',
    items: [
      {
        id: '1',
        name: 'Item A',
        prices: {
          [ZERO_ADDRESS]: '10000000000000',
          '0xusdc': '34681800000000000',
        },
      },
      {
        id: '2',
        name: 'Item B',
        prices: {
          [ZERO_ADDRESS]: '20000000000000',
          '0xusdc': '69363600000000000',
        },
      },
    ],
  },
];

export default launchpadsData;
