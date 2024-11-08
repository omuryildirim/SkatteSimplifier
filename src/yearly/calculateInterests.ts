import { getRecordsFromFile } from '../getRecordsFromFile.js';
import { calculateInterest } from '../calculateInterest.js';
import { eurRate, gbpRate, usdRate } from '../constants.js';
import { YearlyRecord } from './types.js';

export const calculateInterests = async (
  year: number,
): Promise<YearlyRecord['interest']> => {
  const records = (
    await getRecordsFromFile(`/data/${year}-dividend-interest.csv`)
  ).filter((item) => new Date(item.Time).getFullYear() === year);
  const interest = calculateInterest(records);

  return {
    ...interest,
    total: Object.keys(interest).reduce((total, currency) => {
      if (currency === 'USD') {
        return total + interest[currency] * usdRate;
      } else if (currency === 'EUR') {
        return total + interest[currency] * eurRate;
      } else if (currency === 'GBP') {
        return total + interest[currency] * gbpRate;
      }
      return total + interest[currency];
    }, 0),
  };
};
