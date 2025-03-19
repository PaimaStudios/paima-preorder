import { PaimaParser } from '@paima/sdk/concise';
import type { ParsedSubmittedInput } from './types';

const myGrammar = `
        boughtItems = boughtItems|payload
        deployed = deployed|payload
`;

const parserCommands = {
  boughtItems: {
    payload: (_: string, input: string) => {
      return JSON.parse(input);
    },
  },
  deployed: {
    payload: (_: string, input: string) => {
      return JSON.parse(input);
    },
  },
};

const myParser = new PaimaParser(myGrammar, parserCommands);

function parse(s: string): ParsedSubmittedInput {
  try {
    const parsed = myParser.start(s);
    return { input: parsed.command, ...parsed.args } as any;
  } catch (e) {
    console.log(e, 'Parsing error');
    return { input: 'invalidString' };
  }
}

export default parse;
