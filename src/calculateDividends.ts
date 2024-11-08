export const calculateDividends = (
  records: { Action: string; Name: string; Total: string }[],
) => {
  return records
    .filter((item) => item['Action'].includes('Dividend'))
    .reduce((total, record) => {
      return total + parseFloat(record.Total);
    }, 0);
};
