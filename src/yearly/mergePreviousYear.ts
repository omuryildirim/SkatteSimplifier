import { YearlyRecord } from './types.js';
import { BuyRecords } from '../types.js';

export const parsePreviousYear = (previousYearString: string, lastYear: number): YearlyRecord => {
  if (previousYearString === '') {
    return null;
  }
  const parsedJson: YearlyRecord = JSON.parse(previousYearString);

  return {
    sekProfit: parsedJson.sekProfit,
    allTransactionProfits: parsedJson.allTransactionProfits,
    allTransactionAverages: parsedJson.allTransactionAverages,
    // map string date to date object
    remainingBuys: Object.keys(parsedJson.remainingBuys).reduce(
      (acc, currency) => {
        acc[currency] = {};
        for (const ticker in parsedJson.remainingBuys[currency]) {
          let id = 0;
          acc[currency][ticker] = parsedJson.remainingBuys[currency][
            ticker
          ].map(buy => {
            return {
              ...buy,
              date: new Date(buy.date),
              ticker: ticker,
              id: buy.id || `${lastYear}-${ticker}-${id++}`,
            };
          });
        }
        return acc;
      },
      {} as YearlyRecord['remainingBuys'],
    ),
    dividends: parsedJson.dividends,
    interest: parsedJson.interest,
    deposits: parsedJson.deposits,
    endOfYearFxRate: parsedJson.endOfYearFxRate,
    profitsByTicker: parsedJson.profitsByTicker,
    numberOfSells: parsedJson.numberOfSells,
  };
};

export const mergePreviousYearToBuyRecords = (
  previousYearRecords: YearlyRecord,
  buyRecords: BuyRecords,
) => {
  for (const currency in previousYearRecords.remainingBuys) {
    for (const ticker in previousYearRecords.remainingBuys[currency]) {
      if (
        previousYearRecords.remainingBuys[currency] &&
        previousYearRecords.remainingBuys[currency][ticker]
      ) {
        buyRecords[currency][ticker] = buyRecords[currency][ticker] || [];
        buyRecords[currency][ticker].push(
          ...previousYearRecords.remainingBuys[currency][ticker],
        );
      }
    }
  }
};
