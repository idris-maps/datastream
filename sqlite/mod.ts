import { DB } from "./deps.ts";
import type { PreparedQuery, QueryParameterSet } from "./deps.ts";
import { pipe, PipeFunction } from "../pipe.ts";

interface FromSqliteConfig {
  file: string;
  sql: string;
  params?: QueryParameterSet;
}

export const fromSqlite = async (
  config: FromSqliteConfig,
  funcs: PipeFunction[] = [],
): Promise<{ iterable: AsyncIterableIterator<any> }> => {
  const db = new DB(config.file);
  const result = await db.queryEntries(config.sql, config.params);
  async function* stream() {
    for (let i = 0; i < result.length; i++) {
      yield result[i];
    }
  }

  return pipe(funcs)(stream());
};

interface ToSqliteConfig {
  file: string;
  table: string;
  columns?: string[];
  numeric?: string[];
}

type Column = [name: string, num: boolean];

const createTable = async <T = any>(
  db: DB,
  table: string,
  columns: Column[],
) =>
  db.query(`CREATE TABLE ${table} (${
    columns
      .map(([name, num]) => name + " " + (num ? "REAL" : "TEXT"))
      .join(", ")
  })`);

const prepareQuery = (
  db: DB,
  table: string,
  columns: Column[],
) => {
  const colNames = columns.map(([name]) => name);
  return db.prepareQuery(
    [
      `INSERT INTO ${table}`,
      `(${colNames.join(", ")})`,
      `VALUES (${colNames.map((d) => `:${d}`).join(", ")})`,
    ].join(" "),
  );
};

const closeFile = async (rid?: number) => {
  if (rid) {
    try {
      await Deno.close(rid);
    } catch (e) {
      // do nothing
    }
  }
  return undefined;
};

export const toSqlite = async <T = any>(
  { iterable, rid }: { iterable: AsyncIterableIterator<T>; rid?: number },
  config: ToSqliteConfig,
) => {
  const db = new DB(config.file);
  let columns: Column[] = [];
  let created = false;
  let insert: PreparedQuery | undefined;
  for await (const d of iterable) {
    if (!columns.length) {
      columns = (config.columns || Object.keys(d))
        .map((name) => [name, (config.numeric || []).includes(name)]);
    }
    if (!created) {
      await createTable(db, config.table, columns);
      created = true;
    }
    if (!insert) {
      insert = await prepareQuery(db, config.table, columns);
    }
    // @ts-ignore
    await insert.execute(d);
  }

  await closeFile(rid);

  return;
};
