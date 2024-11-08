import { Investments } from './yearly/types.js';

export const calculateInvestments = (
  records: { Action: string; Name: string; Total: string }[],
): Investments => {
  const investments = {
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
  };

  for (const record of records) {
    if (record['Action'] === 'Deposit') {
      investments.totalDeposit += parseFloat(record['Total']);
    } else if (
      record['Currency conversion fee'] &&
      (record['Action'] === 'Market buy' || record['Action'] === 'Limit buy') &&
      record['Currency (Currency conversion fee)'] === 'SEK'
    ) {
      investments.totalInvestedInSek += parseFloat(record['Total']);

      if (record['Currency (Price / share)'] === 'USD') {
        investments.investedInUSD.amountInSek += parseFloat(record['Total']);
        investments.investedInUSD.amount +=
          parseFloat(record['Price / share']) *
          parseFloat(record['No. of shares']);
      } else if (record['Currency (Price / share)'] === 'EUR') {
        investments.investedInEUR.amountInSek += parseFloat(record['Total']);
        investments.investedInEUR.amount +=
          parseFloat(record['Price / share']) *
          parseFloat(record['No. of shares']);
      } else if (record['Currency (Price / share)'] === 'GBP') {
        investments.investedInGBP.amountInSek += parseFloat(record['Total']);
        investments.investedInGBP.amount +=
          parseFloat(record['Price / share']) *
          parseFloat(record['No. of shares']);
      } else if (record['Currency (Price / share)'] === 'GBX') {
        investments.investedInGBX.amountInSek += parseFloat(record['Total']);
        investments.investedInGBX.amount +=
          (parseFloat(record['Price / share']) *
            parseFloat(record['No. of shares'])) /
          100;
      }
    }
  }

  // calculate conversion rates
  investments.investedInUSD.conversionRate =
    investments.investedInUSD.amountInSek / investments.investedInUSD.amount;
  investments.investedInEUR.conversionRate =
    investments.investedInEUR.amountInSek / investments.investedInEUR.amount;
  investments.investedInGBP.conversionRate =
    investments.investedInGBP.amountInSek / investments.investedInGBP.amount;
  investments.investedInGBX.conversionRate =
    investments.investedInGBX.amountInSek / investments.investedInGBX.amount;

  return investments;
};
