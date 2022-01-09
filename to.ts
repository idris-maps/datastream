const closeFile = async (rid?: number) => {
  if (rid) {
    try {
      await Deno.close(rid)
    } catch (e) {
      // do nothing
    }
  }
  return undefined
}

interface Stream<T = any> {
  iterable: AsyncIterableIterator<T>
  rid?: number
}

export const toArray = async <T = any>({ iterable, rid }: Stream<T>) => {
  let r: T[] = [];
  for await (const d of iterable) {
    r.push(d);
  }
  await closeFile(rid)
  return r;
};

export const find = async <T = any>(
  func: (d: T) => boolean,
) => {
  return async ({ iterable, rid }: Stream<T>) => {
    for await (const d of iterable) {
      if (func(d)) {
        await closeFile(rid)
        return d
      }
    }
    await closeFile(rid)
    return undefined
  }
}

export const reduce = <A = any, B = any>(
  func: (r: B, d: A, i: number) => B,
  start: B,
) => {
  return async ({ iterable, rid }: Stream<A>) => {
    let i = -1;
    let r = start;
    for await (const d of iterable) {
      i++;
      r = func(r, d, i);
    }
    await closeFile(rid)
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

export const toNdjsonStdout = async <T = any>({ iterable, rid }: Stream<T>) => {
  for await (const d of iterable) {
    log(JSON.stringify(d));
  }
  await closeFile(rid)
};

export const toNdjsonFile = async <T = any>(
  { iterable, rid }: Stream<T>,
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
  await closeFile(rid)
};

const isString = (d: any): d is string => d === String(d);
const toDsvLine = (head: string[], delimiter: string, d: any) =>
  head
    .reduce((r: any[], key: string) => {
      // @ts-ignore
      const val = d[key];
      r.push(isString(val) ? `"${val}"` : val);
      return r;
    }, [])
    .join(delimiter);

export const toDsvStdout = async <T = any>(
  { iterable, rid }: Stream<T>,
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
  await closeFile(rid)
};

export const toDsvFile = async <T = any>(
  { iterable, rid }: Stream<T>,
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
  await closeFile(rid)
};
