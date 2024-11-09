import { Currencies, SellRecords } from '../types.js';

export const calculateNumberOfSells = (
  currencies: Currencies[],
  sells: SellRecords,
) => {
  return currencies.reduce((averages, currency) => {
    Object.keys(sells[currency]).forEach((t) => {
      averages += sells[currency][t].length;
    });
    return averages;
  }, 0);
};
