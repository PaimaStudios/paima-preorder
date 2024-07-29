import type { Pool } from 'pg';

import parse from './parser.js';
import type Prando from '@paima/sdk/prando';
import { SCHEDULED_DATA_ADDRESS, type STFSubmittedData } from '@paima/sdk/utils';
import type { SQLUpdate } from '@paima/node-sdk/db';
import { getDynamicExtensionByName } from '@paima/node-sdk/utils-backend';
import { buyItems } from './persist/global.js';

// entrypoint for your state machine
export default async function (
  inputData: STFSubmittedData,
  blockHeight: number,
  randomnessGenerator: Prando,
  dbConn: Pool
): Promise<SQLUpdate[]> {
  console.log(inputData, 'parsing input data');
  const input = parse(inputData.inputData);
  console.log(`Processing input string: ${inputData.inputData}`);
  console.log(`Input string parsed as: ${input.input}`);

  switch (input.input) {
    case 'boughtItems':
      if (inputData.realAddress !== SCHEDULED_DATA_ADDRESS) {
        console.log(
          `WARNING: Scheduled Events can only be called from paima-engine. Called by ${JSON.stringify(inputData)}`
        );
        return [];
      }
      return buyItems({
        inputData: input,
        txHash: inputData.scheduledTxHash ?? '0x',
        launchpadAddress: await getContractAddressForEvent(dbConn, inputData.extensionName!),
        dbConn,
        blockHeight,
      });
    case 'deployed':
      if (inputData.realAddress !== SCHEDULED_DATA_ADDRESS) {
        console.log(
          `WARNING: Scheduled Events can only be called from paima-engine. Called by ${JSON.stringify(inputData)}`
        );
        return [];
      }
      return [];
    default:
      return [];
  }
}

async function getContractAddressForEvent(dbConn: Pool, extensionName: string): Promise<string> {
  const contract = await getDynamicExtensionByName(dbConn, extensionName);
  return contract[0].contractAddress;
}
