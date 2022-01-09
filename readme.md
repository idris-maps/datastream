# datastream

Building blocks to read and transform data streams

## Sources

### fromFile

Opens a file and creates a stream of lines

```ts
type fromFile = (
  path: string,
  funcs?: PipeFunction[],
) => Promise<{ iterator: AsyncIterableIterator<any>, rid: number }>;
```

### fromStdin

Reads a stream from stdin

```ts
type fromStdin = (
  funcs: PipeFunction[] = [],
) => { iterator: AsyncIterableIterator<string>, rid: number }
```

### fromNdjsonFile

Opens a ndjson (new line delimited JSON) file and creates a stream of JSON
objects

```ts
type fromNdjsonFile = (
  path: string,
  funcs?: PipeFunction[],
) => Promise<{ iterator: AsyncIterableIterator<any>, rid: number }>;
```

### fromNdjsonStdin

Reads and parses a stream of ndjson from stdin

```ts
type fromNdjsonStdin = (
  funcs?: PipeFunction[],
) => { iterator: AsyncIterableIterator<any> };
```

### fromDsvFile

Opens a dsv (delimiter separated values) file and creates a stream of JSON
objects

The first line is expected to be the column labels

```ts
type fromDsvFile = (
  path: string,
  config?: {
    delimiter?: string; // default "," (csv)
    numeric?: string[]; // list of numeric columns
    bool?: string[]; // list of boolean columns
  },
  funcs?: PipeFunction[],
) => Promise<{ iterator: AsyncIterableIterator<any>, rid: number }>;
```

### fromDsvStdin

Reads a stream of dsv from stdin and parses it as JSON objects

```ts
type fromDsvStdin = (
  config?: {
    delimiter?: string; // default "," (csv)
    numeric?: string[]; // list of numeric columns
    bool?: string[]; // list of boolean columns
 },
 funcs?: PipeFunction[]
) => { iterator: AsyncIterableIterator<any> }
```

## Transforms

Functions to modify the stream of data

All transforms return a `PipeFunction`

```ts
type PipeFunction = (
  d: AsyncIterableIterator<any>,
) => AsyncIterableIterator<any>;
```

### map

```ts
type map = <A = any, B = any>(func: (d: A, i: number) => B) => PipeFunction;
```

### filter

```ts
type filter = <T = any>(func: (d: T, i: number) => boolean) => PipeFunction;
```

### offset

```ts
type offset = (n: number) => PipeFunction;
```

### limit

```ts
type limit = (n: number) => PipeFunction;
```

## Output

### toArray

```ts
type toArray = <T = any>({ iterator: AsyncIterableIterator<T>, rid?: number }) => Promise<T[]>;
```

### find

```ts
type find = <T>(
  func: (d: T) => boolean,
) => ({ iterator: AsyncIterableIterator<T>, rid?: number }) =>
  Promise<T | undefined>;
```

### reduce

```ts
type reduce = <A = any, B = any>(
  func: (r: B, d: A, i: number) => B,
  start: B,
) => ({
  iterator: AsyncIterableIterator<A>,
  rid?: number,
}) => Promise<B>;
```

### toNdjsonStdout

```ts
type toNdjsonStdout = <T = any>({
  iterator: AsyncIterableIterator<T>,
  rid?: number,
}) => Promise<void>;
```

### toDsvStdout

```ts
type toDsvStdout = <T = any>(
  { iterator: AsyncIterableIterator<T>, rid?: number },
  delimiter?: string,
) => Promise<void>;
```

### toNdjsonFile

```ts
type toNdjsonFile = <T = any>(
  { iterator: AsyncIterableIterator<T>, rid?: number },
  path: string,
) => Promise<void>;
```

### toDsvFile

```ts
type toDsvFile = <T = any>(
  { iterator: AsyncIterableIterator<T>, rid?: number },
  path: string,
  delimiter?: string,
) => Promise<void>;
```
