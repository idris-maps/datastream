export type PipeFunction = (
  d: AsyncIterableIterator<any>,
) => AsyncIterableIterator<any>;

export const pipe = <T = any>(
  func: PipeFunction[],
) =>
  (input: AsyncIterableIterator<any>): AsyncIterableIterator<T> =>
    func.reduce((r, f) => f(r), input);
