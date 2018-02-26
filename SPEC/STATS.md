Stats API
=======

#### `bitswap`

`stats.bitswap` and `bitswap.stat` can be used interchangeably. See [`bitswap.stat`](./BITSWAP.md#stat) for more details.

#### `repo`

`stats.repo` and `repo.stat` can be used interchangeably. See [`repo.stat`](./REPO.md#stat) for more details.

#### `bw`

> Get IPFS bandwidth information as an object.

##### `Go` **WIP**

##### `JavaScript` - ipfs.stats.bw([options, callback])

Where:

- `options` is an opcional object that might contain the following keys:
  - `peer` specifies a peer to print bandwidth for.
  - `proto` specifies a protocol to print bandwidth for.
  - `poll` is used to print bandwidth at an interval.
  - `interval` is the time interval to wait between updating output, if `poll` is true.

`callback` must follow `function (err, stat) {}` signature, where `err` is an Error if the operation was not successful.

`stat` is, in both cases, an Object containing the following keys:

- `totalIn` - is a [Big Int][big], in bytes.
- `totalOut` - is a [Big Int][big], in bytes.
- `rateIn` - is a [Big Int][big], in bytes.
- `rateOut` - is a [Big Int][big], in bytes.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.stats.bw((err, stats) => console.log(stats))

// { totalIn: Big {...},
//   totalOut: Big {...},
//   rateIn: Big {...},
//   rateOut: Big {...} }
```

#### `bwPullStream`

> Get IPFS bandwidth information as a [Pull Stream][ps].

##### `Go` **WIP**

##### `JavaScript` - ipfs.stats.bwPullStream([options]) -> [Pull Stream][ps]

Options are described on [`ipfs.stats.bw`](#bw).

**Example:**

```JavaScript
const pull = require('pull-stream')
const log = require('pull-stream/sinks/log')

const stream = ipfs.stats.bwPullStream({ poll: true })

pull(
  stream,
  log()
)

// { totalIn: Big {...},
//   totalOut: Big {...},
//   rateIn: Big {...},
//   rateOut: Big {...} }
// ...
// Ad infinitum
```

#### `bwReadableStream`

> Get IPFS bandwidth information as a [Readable Stream][rs].

##### `Go` **WIP**

##### `JavaScript` - ipfs.stats.bwReadableStream([options]) -> [Readable Stream][rs]

Options are described on [`ipfs.stats.bw`](#bw).

**Examples:**

```JavaScript
const stream = ipfs.stats.bwReadableStream({ poll: true })

stream.on('data', (data) => {
  console.log(data)
}))

// { totalIn: Big {...},
//   totalOut: Big {...},
//   rateIn: Big {...},
//   rateOut: Big {...} }
// ...
// Ad infinitum
```

[big]: https://github.com/MikeMcl/big.js/
[rs]: https://www.npmjs.com/package/readable-stream
[ps]: https://www.npmjs.com/package/pull-stream
