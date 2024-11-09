import fs from 'fs';
import { YearlyRecord } from './types.js';
import { stringifyJSON } from '../shared.js';

/**
 * browse through history folder and get all folders
 * for each folder, get the summary.json file
 * parse the summary.json file
 * merge all the summary.json files
 * save the merged summary.json file
 * return the merged summary.json file
 */
export const generateCompleteInvestmentHistory = () => {
  const historyFolders = fs.readdirSync('./history');
  const summaryFiles = historyFolders.reduce(
    (list, folder) => {
      // check if it is a folder
      if (fs.lstatSync(`./history/${folder}`).isDirectory()) {
        const summaryFile = fs.readFileSync(
          `./history/${folder}/summary.json`,
          {
            encoding: 'utf-8',
          },
        );
        list.push({
          ...JSON.parse(summaryFile),
          year: folder,
        } as YearlyRecord & { year: string });
      }
      return list;
    },
    [] as (YearlyRecord & { year: string })[],
  );
  const completeInvestmentHistory = {
    sekProfit: 0,
    accountValue: 0,
    profitsByYear: {} as Record<string, number>,
    profitsByTicker: {} as YearlyRecord['profitsByTicker'],
    dividends: 0,
    interest: {
      EUR: 0,
      USD: 0,
      GBP: 0,
      SEK: 0,
      total: 0,
    },
    deposits: {
      totalDeposit: 0,
      totalInvestedInSek: 0,
      investedInUSD: {
        amount: 0,
        amountInSek: 0,
        conversionRate: 0,
      },
      investedInEUR: {
        amount: 0,
        amountInSek: 0,
        conversionRate: 0,
      },
      investedInGBP: {
        amount: 0,
        amountInSek: 0,
        conversionRate: 0,
      },
      investedInGBX: {
        amount: 0,
        amountInSek: 0,
        conversionRate: 0,
      },
    },
    numberOfSells: 0,
  } as Pick<
    YearlyRecord,
    | 'sekProfit'
    | 'profitsByTicker'
    | 'dividends'
    | 'interest'
    | 'deposits'
    | 'numberOfSells'
  > & { profitsByYear: Record<string, number>; accountValue: number };

  for (const summary of summaryFiles) {
    completeInvestmentHistory.sekProfit += summary.sekProfit;
    completeInvestmentHistory.dividends += summary.dividends;
    completeInvestmentHistory.deposits.investedInUSD.amount +=
      summary.deposits.investedInUSD.amount;
    completeInvestmentHistory.deposits.investedInUSD.amountInSek +=
      summary.deposits.investedInUSD.amountInSek;

    completeInvestmentHistory.deposits.investedInEUR.amount +=
      summary.deposits.investedInEUR.amount;
    completeInvestmentHistory.deposits.investedInEUR.amountInSek +=
      summary.deposits.investedInEUR.amountInSek;
    completeInvestmentHistory.deposits.investedInGBP.amount +=
      summary.deposits.investedInGBP.amount;
    completeInvestmentHistory.deposits.investedInGBP.amountInSek +=
      summary.deposits.investedInGBP.amountInSek;
    completeInvestmentHistory.deposits.investedInGBX.amount +=
      summary.deposits.investedInGBX.amount;
    completeInvestmentHistory.deposits.investedInGBX.amountInSek +=
      summary.deposits.investedInGBX.amountInSek;
    completeInvestmentHistory.deposits.totalInvestedInSek +=
      summary.deposits.totalInvestedInSek;
    completeInvestmentHistory.deposits.totalDeposit +=
      summary.deposits.totalDeposit;

    completeInvestmentHistory.interest.EUR += summary.interest.EUR;
    completeInvestmentHistory.interest.USD += summary.interest.USD;
    completeInvestmentHistory.interest.GBP += summary.interest.GBP;
    completeInvestmentHistory.interest.SEK += summary.interest.SEK;
    completeInvestmentHistory.interest.total += summary.interest.total;
    completeInvestmentHistory.numberOfSells += summary.numberOfSells;
    completeInvestmentHistory.profitsByYear[summary.year] = summary.sekProfit;

    for (const ticker in summary.profitsByTicker) {
      if (completeInvestmentHistory.profitsByTicker[ticker]) {
        completeInvestmentHistory.profitsByTicker[ticker] +=
          summary.profitsByTicker[ticker];
      } else {
        completeInvestmentHistory.profitsByTicker[ticker] =
          summary.profitsByTicker[ticker];
      }
    }
  }

  // sort profitsByTicker
  completeInvestmentHistory.profitsByTicker = Object.fromEntries(
    Object.entries(completeInvestmentHistory.profitsByTicker).sort(
      ([, a], [, b]) => a - b,
    ),
  );

  // calculate conversion rates
  completeInvestmentHistory.deposits.investedInUSD.conversionRate =
    completeInvestmentHistory.deposits.investedInUSD.amountInSek /
    completeInvestmentHistory.deposits.investedInUSD.amount;
  completeInvestmentHistory.deposits.investedInEUR.conversionRate =
    completeInvestmentHistory.deposits.investedInEUR.amountInSek /
    completeInvestmentHistory.deposits.investedInEUR.amount;
  completeInvestmentHistory.deposits.investedInGBP.conversionRate =
    completeInvestmentHistory.deposits.investedInGBP.amountInSek /
    completeInvestmentHistory.deposits.investedInGBP.amount;
  completeInvestmentHistory.deposits.investedInGBX.conversionRate =
    completeInvestmentHistory.deposits.investedInGBX.amountInSek /
    completeInvestmentHistory.deposits.investedInGBX.amount;

  // calculate account value
  completeInvestmentHistory.accountValue =
    completeInvestmentHistory.sekProfit +
    completeInvestmentHistory.deposits.totalInvestedInSek;

  // write the completeInvestmentHistory to a file
  fs.writeFileSync(
    './history/complete-summary.json',
    stringifyJSON(completeInvestmentHistory),
  );
};
