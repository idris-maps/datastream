# sqlite-plugin

## fromSqlite

Returns a stream from a sqlite query

```ts
type fromSqlite: (
  config: FromSqliteConfig,
  funcs?: PipeFunction[],
) => Promise<AsyncIterableIterator<any>>

interface FromSqliteConfig {
  file: string
  sql: string
  params?: QueryParameterSet
}
```

## toSqlite

Inserts a stream into a sqlite database

```ts
type toSqlite: <T = any>(
  iterable: AsyncIterableIterator<T>,
  config: ToSqliteConfig,
) => Promise<void>

interface ToSqliteConfig {
  file: string
  table: string
  columns?: string[]
  numeric?: string[]
}
```
