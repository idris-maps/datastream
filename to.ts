export const toArray = async <T = any>(iterable: AsyncIterableIterator<T>) => {
  let r: T[] = [];
  for await (const d of iterable) {
    r.push(d);
  }
  return r;
};

export const find = async <T = any>(
  func: (d: T) => boolean,
) => {
  return async (iterable: AsyncIterableIterator<T>) => {
    for await (const d of iterable) {
      if (func(d)) {
        return d
      }
    }
    return undefined
  }
}

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

const encode = (d: string) => {
  const encoder = new TextEncoder();
  return encoder.encode(d);
};

export const toNdjsonStdout = async <T = any>(
  iterable: AsyncIterableIterator<T>,
) => {
  for await (const d of iterable) {
    log(JSON.stringify(d));
  }
};

export const toNdjsonFile = async <T = any>(
  iterable: AsyncIterableIterator<T>,
  path: string,
) => {
  let created = false;
  for await (const d of iterable) {
    if (!created) {
      created = true;
      await Deno.writeFile(path, encode(JSON.stringify(d)));
    } else {
      await Deno.writeFile(path, encode("\n" + JSON.stringify(d)), {
        create: false,
        append: true,
      });
    }
  }
};

const isString = (d: any): d is string => d === String(d);
const toDsvLine = (head: string[], delimiter: string, d: any) =>
  head
    .reduce((r: any[], key: string) => {
      // @ts-ignore
      const val = d[key];
      r.push(isString(val) ? `"${val}"` : val)
      return r;
    }, [])
    .join(delimiter);

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
      log(toDsvLine(head, delimiter, d));
    }
  }
};

export const toDsvFile = async <T = any>(
  iterable: AsyncIterableIterator<T>,
  path: string,
  delimiter = ",",
) => {
  let head;
  for await (const d of iterable) {
    if (!head) {
      head = Object.keys(d);
      await Deno.writeFile(path, encode(head.join(delimiter)));
    }
    if (d) {
      await Deno.writeFile(path, encode("\n" + toDsvLine(head, delimiter, d)), {
        append: true,
      });
    }
  }
};
