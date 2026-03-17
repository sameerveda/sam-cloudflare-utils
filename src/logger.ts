/* eslint-disable no-console */
import { invert, last, once } from 'lodash-es';
import { isBrowser, isDevMode } from './utils';
import { env } from '../env';

const logLevels = {
  OFF: 0, // No logging
  FATAL: 100, // The application is unusable. Action needs to be taken immediately.
  ERROR: 200, // An error occurred in the application.
  WARN: 300, // Something unexpected—though not necessarily an error—happened and needs to be watched.
  INFO: 400, // A normal, expected, relevant event happened.
  DEBUG: 500, // Used for debugging purposes
  TRACE: 600, // Used for debugging purposes—includes the most detailed information
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function noop(...args: any[]) {}

export function createLogger(level: number, console: Console, logLevel: number) {
  if (logLevel < level || logLevel === logLevels.OFF) return noop;

  if (isBrowser() || !isDevMode()) {
    switch (level) {
      case logLevels.INFO:
        return console.log;
      case logLevels.DEBUG:
        return console.debug;
      case logLevels.ERROR:
        return console.error;
      case logLevels.FATAL:
        return console.error;
      case logLevels.WARN:
        return console.warn;
      case logLevels.TRACE:
        return console.trace;
    }
  }

  const name = invert(logLevels)[level];

  return function logger(...args: any[]) {
    console.log(`[${name}: ${last(new Error().stack?.split(/\r?\n/)[2].split('/'))}]`, ...args);
  };
}

function init() {
  const logLevelName = (
    env().LOG_LEVEL ||
    env().SERVER_LOG_LEVEL ||
    env().NEXT_PUBLIC_LOG_LEVEL ||
    (isDevMode() ? 'DEBUG' : 'INFO')
  ).toUpperCase();

  const logLevel =
    logLevels[logLevelName.toUpperCase() as keyof typeof logLevels] ?? logLevels.INFO;

  if (isDevMode()) console.log('LOG_LEVEL: ', invert(logLevels)[logLevel]);

  const create = (level: number) => createLogger(level, console, logLevel);

  const noGrouping = (...args: any[]) =>
    console.warn('console.group not available for server', ...args);

  return Object.freeze({
    fatal: create(logLevels.FATAL),
    error: create(logLevels.ERROR),
    warn: create(logLevels.WARN),
    info: create(logLevels.INFO),
    log: create(logLevels.INFO),
    debug: create(logLevels.DEBUG),
    trace: create(logLevels.TRACE),
    group: isBrowser() ? console.group : (noGrouping as typeof console.group),
    groupEnd: isBrowser() ? console.groupEnd : (noGrouping as typeof console.groupEnd),
    flush: noop,
  });
}

export type TLogger = ReturnType<typeof init>;

export const loggerNoOp: TLogger = Object.freeze({
  fatal: noop,
  error: noop,
  warn: noop,
  info: noop,
  debug: noop,
  trace: noop,
  log: noop,
  group: noop,
  groupEnd: noop,
  flush: noop,
});

const _logger = once(init);

export const logger = new Proxy({} as TLogger, {
  get: (_, p: keyof TLogger) => _logger()[p],
});
