import fs from 'fs';
import { AllTransactionProfits } from './types.js';

const readYearlyResult = (
  year: number,
): { allTransactionProfits: AllTransactionProfits } => {
  const fileName = `./history/${year}/summary.json`;
  return JSON.parse(fs.readFileSync(fileName, 'utf8'));
};

const writeBlanketter = (blanketter: string, year: number) => {
  fs.writeFileSync(`./history/${year}/BLANKETTER.SRU`, blanketter);
};

export const createBlanketterFile = ({
  year,
  personNummer,
  name,
}: {
  year: number;
  personNummer: number;
  name: string;
}) => {
  const { allTransactionProfits } = readYearlyResult(year);
  const shares = Object.keys(allTransactionProfits);

  if (!shares.length) {
    return;
  }

  let totalBought = 0,
    totalSold = 0,
    totalProfit = 0,
    totalIndex = -1;

  const blanketterContext = shares.reduce((shareSummary, share) => {
    const shareTotalSold = allTransactionProfits[share].reduce(
      (totalSold, transaction) => {
        return totalSold + Math.round(transaction.total);
      },
      0,
    );

    const shareTotalBought = allTransactionProfits[share].reduce(
      (totalBought, transaction) => {
        return totalBought + Math.round(transaction.buyTotal);
      },
      0,
    );

    const shareTotalProfit = totalSold - totalBought;

    totalBought += shareTotalBought;
    totalSold += shareTotalSold;
    totalProfit += shareTotalProfit;

    return `${shareSummary}
${allTransactionProfits[share].reduce((transactionSummary, transaction) => {
  totalIndex++;

  const index = totalIndex % 9;

  if (totalIndex && index === 0) {
    transactionSummary = `${transactionSummary}
#BLANKETTSLUT
#BLANKETT K4-${year}P4
#IDENTITET ${personNummer} 20240320 215218
#NAMN ${name}`;
  }

  return `${transactionSummary}
#UPPGIFT 31${index}0 ${Math.round(transaction.noOfShares).toString()}
#UPPGIFT 31${index}1 ${transaction.ticker} - ${transaction.name}
#UPPGIFT 31${index}2 ${Math.round(transaction.total)}
#UPPGIFT 31${index}3 ${Math.round(transaction.buyTotal)}
#UPPGIFT 31${index}${transaction.profit >= 0 ? '4' : '5'} ${Math.round(
    Math.abs(transaction.profit),
  )}`;
}, '')}`;
  }, '');

  const blanketter = `#BLANKETT K4-${year}P4
#IDENTITET ${personNummer} 20240320 215218
#NAMN ${name}${blanketterContext.replaceAll('\n\n', '\n')}
#UPPGIFT 3300 ${totalSold}
#UPPGIFT 3301 ${totalBought}
#UPPGIFT 330${totalProfit >= 0 ? '4' : '5'} ${Math.abs(totalProfit)}
#BLANKETTSLUT
#FIL_SLUT`;

  writeBlanketter(blanketter, year);
};
