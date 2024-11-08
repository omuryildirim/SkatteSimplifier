import { getRecordsFromFile } from '../getRecordsFromFile.js';
import { calculateTransactions } from '../calculateTransactions.js';
import { calculateInvestments } from '../calculateInvestments.js';
import { eurRate, gbpRate, usdRate } from '../constants.js';
import fs from 'fs';
import { stringifyJSON } from '../shared.js';
import { Currencies } from '../types.js';
import { createBlanketterFile } from '../createBlanketterFile.js';
import {
  mergePreviousYearToBuyRecords,
  parsePreviousYear,
} from './mergePreviousYear.js';
import { profitsByTicker } from './profitsByTicker.js';
import { YearlyRecord } from './types.js';
import {
  calculateAllTransactionAverages,
  filterAverages,
} from './calculateAllTransactionAverages.js';
import { calculateDividends } from '../calculateDividends.js';
import { calculateInterests } from './calculateInterests.js';
import {
  calculateNetProfitWithFX,
  calculateProfitsPerCurrency,
  calculateSekProfit,
} from './calculateProfits.js';
import { calculateAllTransactionProfits } from './calculateAllTransactionProfits.js';
import { reportErrors } from './reportErrors.js';
import { calculateNumberOfSells } from './calculateNumberOfSells.js';
import { generateCompleteInvestmentHistory } from './generateCompleteInvestmentHistory.js';

export async function yearly() {
  // get parameters from terminal command
  const year = parseInt(process.argv[2]);
  const personNummer = parseInt(process.argv[3]);
  const name = process.argv[4];

  if (!year) {
    throw new Error(
      'Year is required! Please provide a year as first argument: pnpm yearly 2023',
    );
  } else if (!personNummer) {
    throw new Error(
      'Personnummer is required! Please provide a personnummer as second argument: pnpm yearly 2023 198901017777',
    );
  } else if (!name) {
    throw new Error(
      'Name is required! Please provide a name as third argument: pnpm yearly 2023 198901017777 "John Doe"',
    );
  }

  const records = (await getRecordsFromFile(`/data/${year}.csv`)).filter(
    (item) => new Date(item.Time).getFullYear() === year,
  );
  const { buys, sells } = calculateTransactions(records, false);

  try {
    const lastYear = year - 1;
    const lastYearFile = fs.readFileSync(`./history/${lastYear}/summary.json`, {
      encoding: 'utf-8',
    });

    const lastYearRecords = parsePreviousYear(lastYearFile);
    mergePreviousYearToBuyRecords(lastYearRecords, buys);
  } catch (e) {
    console.error(`Could not read last year file (${year - 1})`);
  }

  const currencies = Object.keys(sells) as Currencies[];
  const allTransactionAverages = calculateAllTransactionAverages(
    currencies,
    sells,
    buys,
  );

  const profit = calculateProfitsPerCurrency(
    currencies,
    allTransactionAverages,
  );

  const investments = calculateInvestments(records);

  const netProfitWithFX = calculateNetProfitWithFX(profit, investments);

  const { allTransactionProfits, remainingBuys } =
    calculateAllTransactionProfits(currencies, sells, buys);

  const sekProfit = calculateSekProfit(allTransactionProfits);
  const numberOfSells = calculateNumberOfSells(currencies, sells);

  console.log('Net profit with FX', netProfitWithFX);
  console.log('Transaction profits', sekProfit);
  console.log('Number of sells', numberOfSells);

  reportErrors(allTransactionProfits);

  fs.promises.mkdir('./history', { recursive: true }).catch(console.error);
  fs.promises
    .mkdir(`./history/${year}`, { recursive: true })
    .catch(console.error);

  const yearlyRecord: YearlyRecord = {
    sekProfit,
    allTransactionProfits,
    allTransactionAverages: filterAverages(currencies, allTransactionAverages),
    remainingBuys,
    // remaining,
    endOfYearFxRate: { usdRate, eurRate, gbpRate },
    deposits: investments,
    profitsByTicker: profitsByTicker(allTransactionProfits),
    dividends: calculateDividends(
      (await getRecordsFromFile(`/data/${year}-dividend-interest.csv`)).filter(
        (item) => new Date(item.Time).getFullYear() === year,
      ),
    ),
    interest: await calculateInterests(year),
    numberOfSells,
  };
  fs.writeFileSync(
    `./history/${year}/summary.json`,
    stringifyJSON(yearlyRecord),
    {
      encoding: 'utf-8',
    },
  );

  createBlanketterFile({ year, personNummer, name });
  generateCompleteInvestmentHistory();
}

yearly().then();
