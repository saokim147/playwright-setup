import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import Papa from 'papaparse';
import { Logger } from './logger.js';

export interface CsvReadOptions {

  delimiter?: string;

  dynamicTyping?: boolean;
}

export function readCsv<T extends object>(filePath: string, options: CsvReadOptions = {}): T[] {
  const { delimiter = ',', dynamicTyping = true } = options;
  const absolute = isAbsolute(filePath) ? filePath : join(process.cwd(), filePath);

  if (!existsSync(absolute)) {
    throw new Error(`CSV file not found: ${absolute}`);
  }

  const result = Papa.parse<T>(readFileSync(absolute, 'utf8'), {
    header: true,
    delimiter,
    dynamicTyping,
    skipEmptyLines: true,
  });

  const fatal = result.errors.filter((error) => error.code !== 'UndetectableDelimiter');
  if (fatal.length > 0) {
    const first = fatal[0]!;
    throw new Error(
      `CSV parse error in ${filePath} at row ${first.row ?? '?'}: ${first.message} (${first.code})`,
    );
  }
  if (result.errors.length > 0) {
    Logger.warn('Csv', `${result.errors.length} parse warning(s) in ${filePath} (ignored)`);
  }

  Logger.debug('Csv', `read ${result.data.length} row(s) from ${filePath}`);
  return result.data;
}
