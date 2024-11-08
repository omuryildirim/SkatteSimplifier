import { AllTransactionProfits, BuyRecords, Currencies } from '../types.js';

export type YearlyRecord = {
  sekProfit: number;
  allTransactionProfits: AllTransactionProfits;
  allTransactionAverages: AllTransactionAverages;
  remainingBuys: BuyRecords;
  dividends: number;
  interest: Record<Exclude<Currencies, 'GBX'> | 'SEK' | 'total', number>;
  deposits: Investments;
  endOfYearFxRate: {
    usdRate: number;
    eurRate: number;
    gbpRate: number;
  };
  profitsByTicker: Record<string, number>;
  numberOfSells: number;
};

export type AllTransactionAverages = Record<
  Currencies,
  Record<
    string,
    {
      bought: TransactionProfit;
      sold: TransactionProfit;
    }
  >[]
>;

export type TransactionProfit = {
  total: number;
  noOfShares: number;
  average: number;
  exchangeRate: number;
  totalInSek: number;
  remaining: number;
  profit: number;
};

export type InvestmentDetails = {
  amount: number;
  amountInSek: number;
  conversionRate: number;
};

export type Investments = {
  totalDeposit: number;
  totalInvestedInSek: number;
  investedInUSD: InvestmentDetails;
  investedInEUR: InvestmentDetails;
  investedInGBP: InvestmentDetails;
  investedInGBX: InvestmentDetails;
};
