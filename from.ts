import { readLines } from "./deps.ts";
import { parseDsv, parseJson } from "./transform.ts";
import { pipe, PipeFunction } from "./pipe.ts";

export const fromFile = async (path: string, funcs: PipeFunction[] = []) => {
  const file = await Deno.open(path, { read: true, write: false });
  return pipe(funcs, file.rid)(readLines(file));
};

export const fromStdin = (funcs: PipeFunction[] = []) =>
  pipe(funcs)(readLines(Deno.stdin));

export const fromNdjsonFile = async (
  path: string,
  funcs: PipeFunction[] = [],
) => {
  const file = await Deno.open(path, { read: true, write: false });
  return pipe([parseJson, ...funcs], file.rid)(readLines(file));
};

export const fromNdjsonStdin = (funcs: PipeFunction[] = []) =>
  pipe([parseJson, ...funcs])(readLines(Deno.stdin));

export const fromDsvFile = async (
  path: string,
  config: { delimiter?: string; numeric?: string[]; bool?: string[] } = {},
  funcs: PipeFunction[] = [],
) => {
  const file = await Deno.open(path, { read: true, write: false });
  return pipe([parseDsv(config), ...funcs], file.rid)(readLines(file));
};

export const fromDsvStdin = (
  config: { delimiter?: string; numeric?: string[]; bool?: string[] } = {},
  funcs: PipeFunction[] = [],
) => pipe([parseDsv(config), ...funcs])(readLines(Deno.stdin));
