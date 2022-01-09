export type PipeFunction = (
  d: AsyncIterableIterator<any>,
) => AsyncIterableIterator<any>;

export const pipe = <T = any>(
  func: PipeFunction[],
  rid?: number,
) =>
  (
    input: AsyncIterableIterator<any>,
  ): { iterable: AsyncIterableIterator<T>; rid?: number } => ({
    iterable: func.reduce((r, f) => f(r), input),
    rid,
  });
