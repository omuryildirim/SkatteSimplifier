export type AllTransactionProfits = Record<
  string,
  {
    ticker: string;
    name: string;
    profit: number;
    total: number;
    buyTotal: number;
    noOfShares: number;
    effectiveTransactions: (Buy | Sell)[];
  }[]
>;

export type BuyRecords = Record<Currencies, Record<string, Buy[]>>;

export type SellRecords = Record<Currencies, Record<string, Sell[]>>;

type BuyOrSell = {
  ticker: string;
  noOfShares: number;
  price: number;
  exchangeRate: number;
  total: number;
  date: Date;
  id: string;
  name: string;
};

export type Buy = BuyOrSell & {
  action: 'buy';
};

export type Sell = BuyOrSell & {
  action: 'sell';
};

export type Currencies = 'USD' | 'EUR' | 'GBP' | 'GBX';
