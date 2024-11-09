import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';

export const getRecordsFromFile = async (file: string) => {
  const records = [];
  const parser = fs
    .createReadStream(path.normalize(path.resolve() + file))
    .pipe(
      parse({
        columns: true,
        skip_empty_lines: true,
      }),
    );
  for await (const record of parser) {
    // Work with each record
    records.push(record);
  }
  return records;
};
