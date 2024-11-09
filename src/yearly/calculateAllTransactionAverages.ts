import { BuyRecords, Currencies, SellRecords } from '../types.js';
import { AllTransactionAverages, TransactionProfit } from './types.js';

export const calculateAllTransactionAverages = (
  currencies: Currencies[],
  sells: SellRecords,
  buys: BuyRecords,
) => {
  return currencies.reduce((averages, currency) => {
    const sellShares = Object.keys(sells[currency]);
    const sold = sellShares.reduce((sold, share) => {
      sold[share] = sells[currency][share].reduce(
        (total, transaction) => {
          total.total += transaction.total;
          total.totalInSek +=
            transaction.total * (1 / transaction.exchangeRate);
          total.noOfShares += transaction.noOfShares;
          total.average = total.total / total.noOfShares;
          return total;
        },
        {
          total: 0,
          noOfShares: 0,
          average: 0,
          exchangeRate: 0,
          totalInSek: 0,
        } as {
          average: number;
          total: number;
          noOfShares: number;
          exchangeRate: number;
          totalInSek: number;
        },
      );

      return sold;
    }, {});

    const buyShares = Object.keys(buys[currency]);
    const bought = buyShares.reduce(
      (bought, share) => {
        bought[share] = buys[currency][share].reduce(
          (total, transaction) => {
            total.total += transaction.total;
            total.totalInSek +=
              transaction.total * (1 / transaction.exchangeRate);
            total.noOfShares += transaction.noOfShares;
            total.average = total.total / total.noOfShares;
            return total;
          },
          {
            total: 0,
            noOfShares: 0,
            average: 0,
            exchangeRate: 0,
            totalInSek: 0,
          } as {
            average: number;
            total: number;
            noOfShares: number;
            exchangeRate: number;
            totalInSek: number;
          },
        );

        return bought;
      },
      {} as {},
    );

    averages[currency] = [...sellShares, ...buyShares].reduce(
      (averages, share) => {
        averages[share] = { bought: bought[share], sold: sold[share] };
        return averages;
      },
      {} as AllTransactionAverages[Currencies],
    );

    return averages;
  }, {} as AllTransactionAverages);
};

export const filterAverages = (
  currencies: Currencies[],
  averages: AllTransactionAverages,
) => {
  return currencies.reduce(
    (total, currency) => {
      const shares = Object.keys(averages[currency]);
      total[currency] = shares
        .filter((share) => averages[currency][share].sold)
        .map((share) => {
          return { [share]: averages[currency][share] } as Record<
            string,
            {
              bought: TransactionProfit;
              sold: TransactionProfit;
            }
          >;
        });
      return total;
    },
    Object.fromEntries(
      currencies.map((currency) => [currency, undefined]),
    ) as AllTransactionAverages,
  );
};
