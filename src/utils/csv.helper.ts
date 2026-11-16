import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import Papa from 'papaparse';
import { Logger } from './logger.js';

export interface CsvReadOptions {
  /** Column separator. Defaults to `,`. */
  delimiter?: string;
  /** Cast `true`/`false` and numeric cells. Defaults to `true`. */
  dynamicTyping?: boolean;
}

/**
 * Read a CSV file into typed records, one per data row, keyed by the header row.
 * Parsing (RFC 4180: quoted fields, escaped quotes, embedded newlines) is delegated
 * to PapaParse. Relative paths resolve against the project root (Playwright's cwd).
 *
 * Throws on a missing file or any fatal parse error PapaParse reports.
 *
 * Data-driven usage:
 * ```ts
 * interface LoginRow { username: string; password: string; expectedRole: string }
 * const rows = readCsv<LoginRow>('test-data/login.csv');
 *
 * test.for(rows).run('login as %s shows %s', ({ page }, row) => {
 *   // %s → username, then expectedRole
 * });
 * ```
 */
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

  // PapaParse reports UndetectableDelimiter as Info; everything else is a real defect
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
