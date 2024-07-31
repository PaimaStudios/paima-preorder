import { ZERO_ADDRESS } from '.';
import type { LaunchpadData } from './types';

const MOCK_USDC = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

const launchpadsData: LaunchpadData[] = [
  {
    slug: 'test-launchpad-1',
    address: '0xd8058efe0198ae9dD7D563e1b4938Dcbc86A1F81',
    name: 'Test Launchpad 1',
    description: 'Description of Test Launchpad 1',
    image: '/images/game-icon-towerdefense.webp',
    referralDiscountBps: 100,
    items: [
      {
        id: '1',
        name: 'Item A',
        description: 'Description of Item A',
        prices: {
          [ZERO_ADDRESS]: '10000000000000',
          [MOCK_USDC]: '34681800000000000',
        },
        referralDiscountBps: 500,
      },
      {
        id: '2',
        name: 'Item B',
        description: 'Description of Item B',
        prices: {
          [ZERO_ADDRESS]: '20000000000000',
          [MOCK_USDC]: '69363600000000000',
        },
      },
      {
        id: '100',
        name: 'Free Item X',
        description: 'Description of Free Item X',
        freeAt: {
          [ZERO_ADDRESS]: '100000000000000',
          [MOCK_USDC]: '346818000000000000',
        },
      },
    ],
    timestampStartWhitelistSale: 1724743540,
    timestampStartPublicSale: 1724829940,
    timestampEndSale: 1724916340,
    whitelistedAddresses: ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'],
    curatedPackages: [
      {
        name: 'Package 1',
        description: 'Description of Package 1',
        items: [
          {
            id: '1',
            quantity: 1,
          },
          {
            id: '2',
            quantity: 1,
          },
        ],
      },
      {
        name: 'VIP Package',
        items: [
          {
            id: '1',
            quantity: 10,
          },
          {
            id: '100',
            quantity: 1,
          },
        ],
      },
    ],
  },
  {
    slug: 'test-launchpad-2',
    address: '0x6D544390Eb535d61e196c87d6B9c80dCD8628Acd',
    name: 'Test Launchpad 2',
    description: 'Description of Test Launchpad 2',
    image: '/images/game-icon-junglewars.webp',
    items: [
      {
        id: '1',
        name: 'Item A',
        description: 'Description of Item A',
        prices: {
          [ZERO_ADDRESS]: '10000000000000',
          [MOCK_USDC]: '34681800000000000',
        },
      },
      {
        id: '2',
        name: 'Item B',
        description: 'Description of Item B',
        prices: {
          [ZERO_ADDRESS]: '20000000000000',
          [MOCK_USDC]: '69363600000000000',
        },
      },
    ],
    timestampStartWhitelistSale: 1724743540,
    timestampStartPublicSale: 1724829940,
    timestampEndSale: 1724916340,
    whitelistedAddresses: ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'],
  },
];

export default launchpadsData;
