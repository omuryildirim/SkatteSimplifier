import { AllTransactionProfits } from '../types.js';

export const reportErrors = (allTransactionProfits: AllTransactionProfits) => {
  console.log(
    'dateMismatch',
    Object.keys(allTransactionProfits).reduce((mismatch, share) => {
      allTransactionProfits[share].forEach((transaction) => {
        const buy = transaction.effectiveTransactions.find(
          (t) => t.action === 'buy',
        );
        const sell = transaction.effectiveTransactions.find(
          (t) => t.action === 'sell',
        );
        try {
          if (new Date(buy.date) > new Date(sell.date)) {
            mismatch[share] = mismatch[share] || [];
            mismatch[share].push(transaction);
          }
        } catch (e) {
          throw new Error(share + JSON.stringify(transaction, null, 2));
        }
      });
      return mismatch;
    }, {}),
  );
};
