export type ParsedSubmittedInput = InvalidInput | BuyItemsInput;
export interface InvalidInput {
  input: 'invalidString';
}

export interface BuyItemsInput {
  input: 'boughtItems';
  payload: {
    receiver: string;
    buyer: string;
    paymentToken: string;
    amount: string;
    referrer: string;
    itemsIds: string[];
    itemsQuantities: string[];
  };
}
