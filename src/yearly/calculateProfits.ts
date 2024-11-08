import { AllTransactionProfits, Currencies } from '../types.js';
import { AllTransactionAverages, Investments } from './types.js';
import { eurRate, gbpRate, usdRate } from '../constants.js';

export const calculateProfitsPerCurrency = (
  currencies: Currencies[],
  averages: AllTransactionAverages,
): Record<Currencies, number> => {
  return currencies.reduce(
    (total, currency) => {
      const shares = Object.keys(averages[currency]);
      total[currency] = shares.reduce((total, share) => {
        if (averages[currency][share].sold) {
          try {
            averages[currency][share].bought.remaining =
              averages[currency][share].bought.noOfShares -
              averages[currency][share].sold.noOfShares;
            averages[currency][share].bought.profit =
              averages[currency][share].sold.total -
              averages[currency][share].bought.average *
                averages[currency][share].sold.noOfShares;
          } catch (e) {
            console.error(
              'There is an error with your history for:',
              share,
              averages[currency][share],
            );
            throw e;
          }
          return total + averages[currency][share].bought.profit;
        }

        return total;
      }, 0);
      return total;
    },
    Object.fromEntries<number>(
      currencies.map((currency) => [currency, 0]),
    ) as Record<Currencies, number>,
  );
};

export const calculateNetProfitWithFX = (
  profit: Record<Currencies, number>,
  investments: Investments,
) => {
  const calculateProfit = (profit: number, fx: number) => profit * fx || 0;

  return (
    calculateProfit(profit.USD, usdRate) +
    calculateProfit(profit.EUR, eurRate) +
    calculateProfit(profit.GBP, gbpRate) +
    calculateProfit(profit.GBX, gbpRate) +
    (calculateProfit(investments.investedInUSD.amount, usdRate) +
      calculateProfit(investments.investedInEUR.amount, eurRate) +
      calculateProfit(investments.investedInGBP.amount, gbpRate) +
      calculateProfit(investments.investedInGBX.amount, gbpRate) / 100) -
    investments.totalInvestedInSek
  );
};

export const calculateSekProfit = (
  allTransactionProfits: AllTransactionProfits,
) => {
  return Object.keys(allTransactionProfits).reduce((total, share) => {
    return (
      total +
      allTransactionProfits[share].reduce((total, transaction) => {
        return total + transaction.profit;
      }, 0)
    );
  }, 0);
};
