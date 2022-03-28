# Reproduce steps:

1. yarn
2. yarn --cwd packages/test build
3. yarn prepare
4. yarn build
5. yarn preview --open
6. open devtool/console, you will see error: `Uncaught ReferenceError: exports is not defined`

# More

## Bug of @rollup/plugin-inject: exports not replaced

1. Open `dist/assets/vendor.<hash>.js` and format with VSCode by press `cmd+shift+p/Format Document with.../Prettier-Standard - JavaScript formatter`, then save.

2. Search `defineProperty\(.*?, '__esModule` in `dist/assets/vendor.<hash>.js` with `Use Regular Expression`:

```
12 results - 1 file

dist/assets/vendor.<hash>.js:
     3:   var u = Object.defineProperty({}, '__esModule', { value: !0 })
    26: Object.defineProperty(te, '__esModule', { value: !0 })
    57:   Object.defineProperty(n, '__esModule', { value: !0 })
  1782: Object.defineProperty(exports, '__esModule', { value: !0 }) <---- messageReader.js
  2010: Object.defineProperty(exports, '__esModule', { value: !0 }) <---- messageWritter.js
  2169:   Object.defineProperty(n, '__esModule', { value: !0 }),
  2272:   Object.defineProperty(n, '__esModule', { value: !0 })
  2343:   Object.defineProperty(n, '__esModule', { value: !0 })
  2498: Object.defineProperty(Pe, '__esModule', { value: !0 })
  2535: Object.defineProperty(ze, '__esModule', { value: !0 })
  2565:   Object.defineProperty(n, '__esModule', { value: !0 })
  3322: Object.defineProperty(Ze, '__esModule', { value: !0 })

```

Only `messageReader.js` and `messageWrite.js` are not correctly transformed.
By remove `inject plugin` in `vite.config.ts`, `exports` transformed to correct variable name.

## Maybe bug of vite: '\n' in string got removed

[Source code of messageReader.ts](https://github.com/microsoft/vscode-languageserver-node/blob/release/jsonrpc/5.0.1/jsonrpc/src/messageReader.ts#L16):

```ts
'use strict';

import { Socket } from 'net';
import { ChildProcess } from 'child_process';

import { Message } from './messages';
import { Event, Emitter } from './events';
import * as Is from './is';

let DefaultSize: number = 8192;
let CR: number = Buffer.from('\r', 'ascii')[0];
let LF: number = Buffer.from('\n', 'ascii')[0]; // <-----
let CRLF: string = '\r\n'; // <-----

class MessageBuffer {

	private encoding: BufferEncoding;
	private index: number;
	private buffer: Buffer;

	constructor(encoding: BufferEncoding = 'utf8') {
		this.encoding = encoding;
		this.index = 0;
		this.buffer = Buffer.allocUnsafe(DefaultSize);
	}
  //omitted
}
```

Compiled messageReader.js:
https://unpkg.com/browse/vscode-jsonrpc@5.0.1/lib/messageReader.js

Transformed code:
```js
Object.defineProperty(exports, '__esModule', { value: !0 })
const Qe = require('./events'),
  Ie = require('./is')
let Ke = 8192,
  st = ae.Buffer.from('\r', 'ascii')[0],
  at = ae.Buffer.from(
    ` // <-----
`,
    'ascii'
  )[0],
  Ot = `\r
` // <-----
class qt {
  constructor (u = 'utf8') {
    ;(this.encoding = u),
      (this.index = 0),
      (this.buffer = ae.Buffer.allocUnsafe(Ke))
  }
  //omitted
}
```

'\n' got removed not only in these two file but all transformed files.
You can verify that by search newline in not-formatted vendor.hash.js


