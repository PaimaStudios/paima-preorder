import { ZERO_ADDRESS } from '.';
import type { LaunchpadData } from './types';

const launchpadsData: LaunchpadData[] = [
  {
    id: '0xd8058efe0198ae9dD7D563e1b4938Dcbc86A1F81',
    name: 'Test Launchpad 1',
    referralDiscountBps: 100,
    items: [
      {
        id: '1',
        name: 'Item A',
        description: 'Description of Item A',
        prices: {
          [ZERO_ADDRESS]: '10000000000000',
          '0xusdc': '34681800000000000',
        },
        referralDiscountBps: 500,
      },
      {
        id: '2',
        name: 'Item B',
        description: 'Description of Item B',
        prices: {
          [ZERO_ADDRESS]: '20000000000000',
          '0xusdc': '69363600000000000',
        },
      },
      {
        id: '100',
        name: 'Free Item X',
        description: 'Description of Free Item X',
        freeAt: {
          [ZERO_ADDRESS]: '100000000000000',
          '0xusdc': '346818000000000000',
        },
      },
    ],
  },
  {
    id: '0x6D544390Eb535d61e196c87d6B9c80dCD8628Acd',
    name: 'Test Launchpad 2',
    items: [
      {
        id: '1',
        name: 'Item A',
        description: 'Description of Item A',
        prices: {
          [ZERO_ADDRESS]: '10000000000000',
          '0xusdc': '34681800000000000',
        },
      },
      {
        id: '2',
        name: 'Item B',
        description: 'Description of Item B',
        prices: {
          [ZERO_ADDRESS]: '20000000000000',
          '0xusdc': '69363600000000000',
        },
      },
    ],
  },
];

export default launchpadsData;
