import { AllTransactionProfits } from '../types.js';

export const profitsByTicker = (
  allTransactionProfits: AllTransactionProfits,
) => {
  const profitsByTicket = Object.keys(allTransactionProfits).reduce(
    (profits, share) => {
      profits[share] = allTransactionProfits[share].reduce(
        (total, transaction) => {
          return total + transaction.profit;
        },
        0,
      );
      return profits;
    },
    {} as Record<string, number>,
  );

  // sort ascending
  return Object.fromEntries(
    Object.entries(profitsByTicket).sort(([, a], [, b]) => a - b),
  );
};
