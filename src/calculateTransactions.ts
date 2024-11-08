import { eurRate, gbpRate, usdRate } from './constants.js';
import { BuyRecords, Currencies, SellRecords } from './types.js';

export const calculateTransactions = (
  records: {
    Action: string;
    Name: string;
    Ticker: string;
  }[],
  exchangeRateFromYearEnd?: boolean,
) => {
  const buyRates = records.reduce(
    (buys, item) => {
      const currency = item['Currency (Price / share)'];
      buys[currency] = buys[currency] || { exchangeRate: 0, total: 0 };
      if (item.Action.includes('buy')) {
        if (item['Currency (Total)'] === 'SEK') {
          buys[currency].exchangeRate +=
            parseFloat(item['Total']) * parseFloat(item['Exchange rate']);
          buys[currency].total += parseFloat(item['Total']);
        }
      }
      return buys;
    },
    {} as Record<string, { exchangeRate: number; total: number }>,
  );
  const buyExchangeRate = Object.keys(buyRates).map((currency) => ({
    currency,
    exchangeRate: buyRates[currency].exchangeRate / buyRates[currency].total,
    total: buyRates[currency].total,
  }));

  const buys: BuyRecords = records.reduce((buys, item) => {
    const currency: Currencies = item['Currency (Price / share)'];
    if (item.Action.includes('buy')) {
      buys[currency] = buys[currency] || {};
      buys[currency][item.Ticker] = buys[currency][item.Ticker] || [];

      let exchangeRate = parseFloat(item['Exchange rate']);
      if (item['Currency (Price / share)'] === 'GBX') {
        exchangeRate = parseFloat(item['Exchange rate']) / 100;
      }

      if (exchangeRateFromYearEnd) {
        exchangeRate = buyExchangeRate.filter(
          (rate) => rate.currency === currency,
        )[0].exchangeRate;

        if (item['Currency (Price / share)'] === 'GBX') {
          exchangeRate = exchangeRate / 100;
        }
      }

      if (exchangeRate === 1) {
        if (
          item['Currency (Price / share)'] === 'GBX' ||
          item['Currency (Price / share)'] === 'GBP'
        ) {
          exchangeRate = 1 / gbpRate;
        } else if (item['Currency (Price / share)'] === 'USD') {
          exchangeRate = 1 / usdRate;
        } else if (item['Currency (Price / share)'] === 'EUR') {
          exchangeRate = 1 / eurRate;
        }
      }

      if (item['Currency (Total)'] === 'SEK') {
        buys[currency][item.Ticker].push({
          noOfShares: parseFloat(item['No. of shares']),
          price: parseFloat(item['Price / share']),
          total: exchangeRate * parseFloat(item['Total']),
          exchangeRate,
          date: new Date(item['Time']),
          action: 'buy',
          ticker: item.Ticker,
          id: item['ID'],
          name: item.Name,
        });
      } else {
        buys[currency][item.Ticker].push({
          noOfShares: parseFloat(item['No. of shares']),
          price: parseFloat(item['Price / share']),
          total: parseFloat(item['Total']),
          exchangeRate,
          date: new Date(item['Time']),
          action: 'buy',
          ticker: item.Ticker,
          id: item['ID'],
          name: item.Name,
        });
      }
      buys[currency][item.Ticker].sort((a, b) =>
        a.price - b.price < 0 ? -1 : 1,
      );
    }
    return buys;
  }, {} as BuyRecords);

  const sells: SellRecords = records.reduce((sells, item) => {
    const currency: Currencies = item['Currency (Price / share)'];

    let exchangeRate = parseFloat(item['Exchange rate']);
    if (item['Currency (Price / share)'] === 'GBX') {
      exchangeRate = parseFloat(item['Exchange rate']) / 100;
    }

    if (exchangeRate === 1 || exchangeRateFromYearEnd) {
      if (
        item['Currency (Price / share)'] === 'GBX' ||
        item['Currency (Price / share)'] === 'GBP'
      ) {
        exchangeRate = 1 / gbpRate;
      } else if (item['Currency (Price / share)'] === 'USD') {
        exchangeRate = 1 / usdRate;
      } else if (item['Currency (Price / share)'] === 'EUR') {
        exchangeRate = 1 / eurRate;
      }
    }

    if (item.Action.includes('sell')) {
      sells[currency] = sells[currency] || {};
      sells[currency][item.Ticker] = sells[currency][item.Ticker] || [];
      if (item['Currency (Total)'] === 'SEK') {
        sells[currency][item.Ticker].push({
          noOfShares: parseFloat(item['No. of shares']),
          price: parseFloat(item['Price / share']),
          total: exchangeRate * parseFloat(item['Total']),
          exchangeRate,
          date: new Date(item['Time']),
          action: 'sell',
          ticker: item.Ticker,
          id: item['ID'],
          name: item.Name,
        });
      } else {
        sells[currency][item.Ticker].push({
          noOfShares: parseFloat(item['No. of shares']),
          price: parseFloat(item['Price / share']),
          total: parseFloat(item['Total']),
          exchangeRate,
          date: new Date(item['Time']),
          action: 'sell',
          ticker: item.Ticker,
          id: item['ID'],
          name: item.Name,
        });
      }
      sells[currency][item.Ticker].sort((a, b) =>
        b.price - a.price < 0 ? -1 : 1,
      );
    }
    return sells;
  }, {} as SellRecords);

  return { buys, sells };
};
