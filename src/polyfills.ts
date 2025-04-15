
import { Buffer } from 'buffer';

(window as any).global = window;
(window as any).Buffer = Buffer;

(window as any).process = {
  env: { NODE_ENV: 'production' },
  version: '',
  nextTick: function(fn: Function) {
    setTimeout(fn, 0);
  }
};

// for Metaplex
// Polyfill stream and http
// import * as streamBrowserify from 'stream-browserify';
// import http from 'http-browserify';
// import util from 'util';

// (window as any).Stream = streamBrowserify;
// (window as any).stream = streamBrowserify;
// (window as any).http = http;
// (window as any).util = util;

// custom-typings.d.ts:
// declare module 'stream-browserify';
// declare module 'http-browserify';
