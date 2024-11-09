import { BuyRecords, Currencies } from '../types.js';

export const getRemainingBuys = (
  currencies: Currencies[],
  buys: BuyRecords,
) => {
  return currencies.reduce((list, currency) => {
    const shares = Object.keys(buys[currency]);
    list[currency] = shares.reduce((list, share) => {
      list[share] = buys[currency][share].filter(
        (buy) => buy.noOfShares > 0.00001,
      );
      if (!list[share].length) {
        delete list[share];
      }
      return list;
    }, {});
    return list;
  }, {} as BuyRecords);
};
