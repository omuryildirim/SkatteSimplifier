import {
  AllTransactionProfits,
  Buy,
  BuyRecords,
  Currencies,
  Sell,
  SellRecords,
} from '../types.js';
import { getRemainingBuys } from './getRemainingBuys.js';

export const calculateAllTransactionProfits = (
  currencies: Currencies[],
  sells: SellRecords,
  buys: BuyRecords,
): {
  allTransactionProfits: AllTransactionProfits;
  remainingBuys: BuyRecords;
} => {
  const copyBuys = structuredClone(buys);
  const copySells = structuredClone(sells);

  const allTransactionProfits = currencies.reduce((averages, currency) => {
    const sellShares = Object.keys(copySells[currency]);

    const sold = sellShares.reduce((sold, share) => {
      sold[share] = copySells[currency][share]
        .sort((a, b) => (new Date(a.date) > new Date(b.date) ? 1 : -1))
        .map((sellTransaction) => {
          let buyTotal = 0;
          const total =
            sellTransaction.total * (1 / sellTransaction.exchangeRate);
          const noOfShares = sellTransaction.noOfShares;

          const effectiveTransactions: (Buy | Sell)[] = [
            {
              ...sellTransaction,
              action: 'sell',
              date: new Date(sellTransaction.date),
            } as Sell,
          ];

          copyBuys[currency][share]
            .filter((a) => new Date(a.date) < new Date(sellTransaction.date))
            .sort((a, b) => (a.price - b.price > 0 ? -1 : 1))
            .some((buyTransaction) => {
              if (buyTransaction.noOfShares > 0.00001) {
                //if (buyTransaction.date >= sellTransaction.date) {
                //  return false;
                //} else
                if (
                  buyTransaction.noOfShares - sellTransaction.noOfShares >=
                  0
                ) {
                  effectiveTransactions.push({
                    ...buyTransaction,
                    noOfShares: sellTransaction.noOfShares,
                    total:
                      buyTransaction.total *
                      (sellTransaction.noOfShares / buyTransaction.noOfShares),
                    action: 'buy',
                    date: new Date(buyTransaction.date),
                  } as Buy);

                  const buyDeduction =
                    buyTransaction.total *
                    (sellTransaction.noOfShares / buyTransaction.noOfShares);
                  buyTotal += buyDeduction * (1 / buyTransaction.exchangeRate);
                  buyTransaction.noOfShares =
                    buyTransaction.noOfShares - sellTransaction.noOfShares;
                  buyTransaction.total = buyTransaction.total - buyDeduction;
                  sellTransaction.noOfShares = 0;
                  sellTransaction.total = 0;
                  return true;
                } else {
                  effectiveTransactions.push({
                    ...buyTransaction,
                    date: new Date(buyTransaction.date),
                    action: 'buy',
                  } as Buy);

                  const sellDeduction =
                    sellTransaction.total *
                    (buyTransaction.noOfShares / sellTransaction.noOfShares);
                  sellTransaction.noOfShares =
                    sellTransaction.noOfShares - buyTransaction.noOfShares;
                  sellTransaction.total = sellTransaction.total - sellDeduction;
                  buyTotal +=
                    buyTransaction.total * (1 / buyTransaction.exchangeRate);
                  buyTransaction.noOfShares = 0;
                  buyTransaction.total = 0;
                  return false;
                }
              }
              return false;
            });

          return {
            ticker: share,
            name: sellTransaction.name,
            profit: total - buyTotal,
            total,
            buyTotal,
            noOfShares,
            effectiveTransactions,
          };
        });

      return sold;
    }, {} as AllTransactionProfits);

    return { ...averages, ...sold };
  }, {} as AllTransactionProfits);

  return {
    allTransactionProfits,
    remainingBuys: getRemainingBuys(currencies, copyBuys),
  };
};
