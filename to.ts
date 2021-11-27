export const toArray = async <T = any>(iterable: AsyncIterableIterator<T>) => {
  let r: T[] = [];
  for await (const d of iterable) {
    r.push(d);
  }
  return r;
};

export const reduce = <A = any, B = any>(
  func: (r: B, d: A, i: number) => B,
  start: B,
) => {
  return async (iterable: AsyncIterableIterator<A>) => {
    let i = -1;
    let r = start;
    for await (const d of iterable) {
      i++;
      r = func(r, d, i);
    }
    return r;
  };
};

const log = (d: any) => {
  try {
    console.log(d);
  } catch {
    // ignore "broken pipe" error
    // when using "... | head -10" for example
    return;
  }
};

export const toNdjsonStdout = async <T = any>(
  iterable: AsyncIterableIterator<T>,
) => {
  for await (const d of iterable) {
    log(JSON.stringify(d));
  }
};

const isString = (d: any): d is string => d === String(d);

export const toDsvStdout = async <T = any>(
  iterable: AsyncIterableIterator<T>,
  delimiter = ",",
) => {
  let head;
  for await (const d of iterable) {
    if (!head) {
      head = Object.keys(d);
      log(head.join(delimiter));
    }
    if (d) {
      log(
        head
          .reduce((r: any[], key: string) => {
            // @ts-ignore
            const val = d[key];
            return [...r, isString(val) ? `"${val}"` : val];
          }, [])
          .join(delimiter),
      );
    }
  }
};
