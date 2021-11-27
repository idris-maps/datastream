import { pipe } from "./pipe.ts";

export const map = <A = any, B = any>(func: (d: A, i: number) => B) =>
  async function* (iterable: AsyncIterableIterator<A>) {
    let i = -1;
    for await (const d of iterable) {
      i++;
      yield func(d, i);
    }
  };

export const filter = <T = any>(func: (d: T, i: number) => boolean) =>
  async function* (iterable: AsyncIterableIterator<T>) {
    let i = -1;
    for await (const d of iterable) {
      i++;
      const ok = await func(d, i);
      if (ok) yield d;
    }
  };

export const offset = <T = any>(n: number) =>
  async function* (iterable: AsyncIterableIterator<T>) {
    let i = 0;
    for await (const d of iterable) {
      i++;
      if (i > n) {
        yield d;
      }
    }
  };

export const limit = <T = any>(n: number) =>
  async function* (iterable: AsyncIterableIterator<T>) {
    let i = 0;
    for await (const d of iterable) {
      i++;
      if (i <= n) {
        yield d;
      }
    }
  };

export const parseJson = pipe([
  map((d: string) => {
    try {
      return JSON.parse(d);
    } catch (e) {
      return undefined;
    }
  }),
  filter(Boolean),
]);

const splitCsvRow = (delimiter: string, line: string) => {
  let inQuote = false;
  let row: string[] = [];

  for (let col = 0, char = 0; char < line.length; char++) {
    let current = line[char];
    let next = line[char + 1];
    row[col] = row[col] || "";

    if (current === '"' && inQuote && next === '"') {
      row[col] += current;
      ++char;
      continue;
    }

    if (current === '"') {
      inQuote = !inQuote;
      continue;
    }

    if (current === delimiter && !inQuote) {
      ++col;
      continue;
    }

    row[col] += current;
  }

  return row;
};

interface CsvProp {
  property: string;
  numeric?: boolean;
  bool?: boolean;
}

const parseDsvRow = (
  delimiter: string,
  properties: CsvProp[],
  line: string,
): { [key: string]: number | boolean | string } => {
  const parts = splitCsvRow(delimiter, line);
  return properties.reduce((r, d, i) => {
    const v = parts[i];
    return {
      ...r,
      [d.property]: d.numeric
        ? Number(v)
        : d.bool
        ? !(v === "false" || v === "0")
        : v,
    };
  }, {});
};

export const parseDsv = ({
  delimiter = ",",
  numeric = [],
  bool = [],
}: { delimiter?: string; numeric?: string[]; bool?: string[] }) =>
  async function* (iterable: AsyncIterableIterator<string>) {
    let head: CsvProp[] | undefined;
    for await (const d of iterable) {
      if (!head) {
        head = splitCsvRow(delimiter, d)
          .map((property) => ({
            property,
            numeric: numeric.includes(property),
            bool: bool.includes(property),
          }));
      } else if (d.trim() !== "") {
        yield parseDsvRow(delimiter, head, d);
      }
    }
  };
