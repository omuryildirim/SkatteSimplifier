import { Currencies } from './types.js';

export const calculateInterest = (
  records: { Action: string; Name: string; Total: string }[],
) => {
  return records
    .filter((item) => item['Action'].includes('Interest on cash'))
    .reduce(
      (total, record) => {
        const currency = record['Currency (Total)'];
        total[currency] = total[currency] || 0;
        total[currency] += parseFloat(record['Total']);
        return total;
      },
      {} as Record<Currencies | 'SEK', number>,
    );
};
