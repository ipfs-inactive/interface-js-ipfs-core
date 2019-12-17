# Files API

> The files API enables users to use the File System abstraction of IPFS. There are two Files API, one at the top level, the original `add`, `cat`, `get` and `ls`, and another behind the [`files`, also known as MFS](https://github.com/ipfs/specs/issues/98). [We are currently going through a revamping process of these APIs to make them more user-friendly](https://github.com/ipfs/interface-ipfs-core/issues/284).

#### The Regular API
The regular, top-level API for add, cat, get and ls Files on IPFS
- [add](#add)
- [cat](#cat)
- [get](#get)
- [ls](#ls)

#### The Files API
The Files API, aka MFS (Mutable File System)
- [files.cp](#filescp)
- [files.flush](#filesflush)
- [files.ls](#filesls)
- [files.mkdir](#filesmkdir)
- [files.mv](#filesmv)
- [files.read](#filesread)
- [files.rm](#filesrm)
- [files.stat](#filesstat)
- [files.write](#fileswrite)

_Explore the Mutable File System through interactive coding challenges in our [ProtoSchool tutorial](https://proto.school/#/mutable-file-system/)._

#### `add`

> Import files and data into IPFS.

##### `ipfs.add(data, [options])`

Where `data` may be:

* `Bytes` (alias for `Buffer`|`ArrayBuffer`|`TypedArray`) [single file]
* `Bloby` (alias for: `Blob`|`File`) [single file]
* `string` [single file]
* `{ path: string, content: Bytes }` [single file]
* `{ path: string, content: Bloby }` [single file]
* `{ path: string, content: string }` [single file]
* `{ path: string, content: Iterable<number> }` [single file]
* `{ path: string, content: Iterable<Bytes> }` [single file]
* `{ path: string, content: AsyncIterable<Bytes> }` [single file]
* `Iterable<number>` [single file]
* `Iterable<Bytes>` [single file]
* `Iterable<Bloby>` [multiple files]
* `Iterable<string>` [multiple files]
* `Iterable<{ path: string, content: Bytes }>` [multiple files]
* `Iterable<{ path: string, content: Bloby }>` [multiple files]
* `Iterable<{ path: string, content: string }>` [multiple files]
* `Iterable<{ path: string, content: Iterable<number> }>` [multiple files]
* `Iterable<{ path: string, content: Iterable<Bytes> }>` [multiple files]
* `Iterable<{ path: string, content: AsyncIterable<Bytes> }>` [multiple files]
* `AsyncIterable<Bytes>` [single file]
* `AsyncIterable<Bloby>` [multiple files]
* `AsyncIterable<String>` [multiple files]
* `AsyncIterable<{ path: string, content: Bytes }>` [multiple files]
* `AsyncIterable<{ path: string, content: Bloby }>` [multiple files]
* `AsyncIterable<{ path: string, content: String }>` [multiple files]
* `AsyncIterable<{ path: string, content: Iterable<number> }>` [multiple files]
* `AsyncIterable<{ path: string, content: Iterable<Bytes> }>` [multiple files]
* `AsyncIterable<{ path: string, content: AsyncIterable<Bytes> }>` [multiple files]

Typically when adding multiple files you'll want to provide an object `{ path, content }`. Where `path` is the path you want to the file to be accessible at from the root CID _after_ it has been added. `content` is the contents of the file. If no `content` is passed, then the path is treated as an empty directory.

`options` is an optional object argument that might include the following keys:

- `chunker` (string, default `size-262144`): chunking algorithm used to build ipfs DAGs. Available formats:
  - size-{size}
  - rabin
  - rabin-{avg}
  - rabin-{min}-{avg}-{max}
- `cidVersion` (integer, default `0`): the CID version to use when storing the data (storage keys are based on the CID, including its version).
- `enableShardingExperiment`: allows to create directories with an unlimited number of entries currently size of unixfs directories is limited by the maximum block size. Note that this is an experimental feature.
- `hashAlg` (string, default `sha2-256`): multihash hashing algorithm to use. [The list of all possible values]( https://github.com/multiformats/js-multihash/blob/master/src/constants.js#L5-L343).
- `onlyHash` (boolean, default `false`): doesn't actually add the file to IPFS, but rather calculates its hash.
- `pin` (boolean, default `true`): pin this object when adding.
- `progress` (function): a function that will be called with the byte length of chunks as a file is added to ipfs.
- `rawLeaves` (boolean, default `false`): if true, DAG leaves will contain raw file data and not be wrapped in a protobuf.
- `shardSplitThreshold` (integer, default `1000`): specifies the maximum size of unsharded directory that can be generated.
- `trickle` (boolean, default `false`): if true will use the trickle DAG format for DAG generation.
  [Trickle definition from go-ipfs documentation](https://godoc.org/github.com/ipsn/go-ipfs/gxlibs/github.com/ipfs/go-unixfs/importer/trickle).
- `wrapWithDirectory` (boolean, default `false`): adds a wrapping node around the content.

**Returns**

| Type | Description |
| -------- | -------- |
| `AsyncIterable<Object>` | An async iterable that yields objects describing the added data |

Each yielded object is of the form:

```JavaScript
{
  path: '/tmp/myfile.txt',
  cid: CID('QmHash'),
  size: 123
}
```

**Example:**

```js
const content = 'ABC'

for await (const result of ipfs.add(content)) {
  console.log(result.cid.toString()) // prints QmNz1UBzpdd4HfZ3qir3aPiRdX5a93XwTuDNyXRc6PKhWW
}
```

Now [ipfs.io/ipfs/Qm...WW](https://ipfs.io/ipfs/QmNz1UBzpdd4HfZ3qir3aPiRdX5a93XwTuDNyXRc6PKhWW) returns the "ABC" string.

The following allows you to add multiple files at once. Note that intermediate directories in file paths will be automatically created and returned in the response along with files:

```JavaScript
const files = [{
  path: '/tmp/myfile.txt',
  content: 'ABC'
}]

for await (const result of ipfs.add(content)) {
  console.log(result)
}
/*
{
  "path": "tmp",
  "hash": "QmWXdjNC362aPDtwHPUE9o2VMqPeNeCQuTBTv1NsKtwypg",
  "size": 67
}
{
  "path": "/tmp/myfile.txt",
  "hash": "QmNz1UBzpdd4HfZ3qir3aPiRdX5a93XwTuDNyXRc6PKhWW",
  "size": 11
}
*/
```

A great source of [examples][] can be found in the tests for this API.

#### `cat`

> Returns a file addressed by a valid IPFS Path.

##### `ipfs.cat(ipfsPath, [options])`

`ipfsPath` can be of type:

- [`CID`][cid] of type:
  - `string` - the base encoded version of the CID
  - [CID](https://github.com/ipfs/js-cid) - a CID instance
  - [Buffer][b] - the raw Buffer of the CID
- `string` - including the ipfs handler, a CID and a path to traverse to, e.g.
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66'
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'
  - 'QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'

`options` is an optional object that may contain the following keys:
  - `offset` is an optional byte offset to start the stream at
  - `length` is an optional number of bytes to read from the stream

**Returns**

| Type | Description |
| -------- | -------- |
| `AsyncIterable<Buffer>` | An async iterable that yields [`Buffer`][b] objects with the contents of `path` |

**Example:**

```JavaScript
const chunks = []
for await (const chunk of ipfs.cat(ipfsPath)) {
  chunks.push(chunk)
}
console.log(Buffer.concat(chunks).toString())
```

A great source of [examples][] can be found in the tests for this API.

#### `get`

> Fetch a file or an entire directory tree from IPFS that is addressed by a valid IPFS Path.

##### `ipfs.get(ipfsPath)`

`ipfsPath` can be of type:

- [`CID`][cid] of type:
  - `string` - the base encoded version of the CID
  - [CID](https://github.com/ipfs/js-cid) - a CID instance
  - [Buffer][b] - the raw Buffer of the CID
- String, including the ipfs handler, a cid and a path to traverse to, e.g.
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66'
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'
  - 'QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'

**Returns**

| Type | Description |
| -------- | -------- |
| `AsyncIterable<Object>` | An async iterable that yields objects representing the files |

Each yielded object is of the form:

```js
{
  path: '/tmp/myfile.txt',
  content: <AsyncIterable<BufferList>>
}
```

Here, each `path` corresponds to the name of a file, and `content` is an async iterable with the file contents.

**Example:**

```JavaScript
const BufferList = require('bl/BufferList')
const cid = 'QmQ2r6iMNpky5f1m4cnm3Yqw8VSvjuKpTcK1X7dBR1LkJF'

for await (const file of ipfs.get(cid)) {
  console.log(file.path)

  const content = new BufferList()
  for await (const chunk of file.content) {
    content.append(chunk)
  }

  console.log(content.toString())
}
```

A great source of [examples][] can be found in the tests for this API.

#### `ls`

> Lists a directory from IPFS that is addressed by a valid IPFS Path.

##### `ipfs.ls(ipfsPath)`

`ipfsPath` can be of type:

- [`CID`][cid] of type:
  - `string` - the base encoded version of the CID
  - [CID](https://github.com/ipfs/js-cid) - a CID instance
  - [Buffer][b] - the raw Buffer of the CID
- String, including the ipfs handler, a cid and a path to traverse to, e.g.
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66'
  - '/ipfs/QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'
  - 'QmXEmhrMpbVvTh61FNAxP9nU7ygVtyvZA8HZDUaqQCAb66/a.txt'

**Returns**

| Type | Description |
| -------- | -------- |
| `AsyncIterable<Object>` | An async iterable that yields objects representing the files |

Each yielded object is of the form:

```js
{
  depth: 1,
  name: 'alice.txt',
  path: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/alice.txt',
  size: 11696,
  cid: CID('QmZyUEQVuRK3XV7L9Dk26pg6RVSgaYkiSTEdnT2kZZdwoi'),
  type: 'file'
}
```

**Example:**

```JavaScript
const cid = 'QmQ2r6iMNpky5f1m4cnm3Yqw8VSvjuKpTcK1X7dBR1LkJF'

for await (const file of ipfs.ls(cid)) {
  console.log(file.path)
}
```

A great source of [examples][] can be found in the tests for this API.

---

## The Files API aka MFS (The Mutable File System)

The Mutable File System (MFS) is a virtual file system on top of IPFS that exposes a Unix like API over a virtual directory. It enables users to write and read from paths without having to worry about updating the graph. It enables things like [ipfs-blob-store](https://github.com/ipfs/ipfs-blob-store) to exist.

#### `files.cp`

> Copy files.

##### `ipfs.files.cp(...from, to, [options])`

Where:

- `from` is the path(s) of the source to copy.  It might be:
  - An existing MFS path to a file or a directory (e.g. `/my-dir/my-file.txt`)
  - An IPFS path (e.g. `/ipfs/QmWGeRAEgtsHW3ec7U4qW2CyVy7eA2mFRVbk1nb24jFyks`)
  - A [CID][cid] instance (e.g. `new CID('QmWGeRAEgtsHW3ec7U4qW2CyVy7eA2mFRVbk1nb24jFyks')`)
- `to` is the path of the destination to copy to
- `options` is an optional Object that might contain the following keys:
  - `parents` is a Boolean value to decide whether or not to make the parent directories if they don't exist (default: false)
  - `format` is what type of nodes to write any newly created directories as (default: `dag-pb`)
  - `hashAlg` is which algorithm to use when creating CIDs for newly created directories. (default: `sha2-256`) [The list of all possible values]( https://github.com/multiformats/js-multihash/blob/master/src/constants.js#L5-L343)
  - `flush` is a Boolean value to decide whether or not to immediately flush MFS changes to disk (default: true)

If `from` has multiple values then `to` must be a directory.

If `from` has a single value and `to` exists and is a directory, `from` will be copied into `to`.

If `from` has a single value and `to` exists and is a file, `from` must be a file and the contents of `to` will be replaced with the contents of `from` otherwise an error will be returned.

If `from` is an IPFS path, and an MFS path exists with the same name, the IPFS path will be chosen.

If `from` is an IPFS path and the content does not exist in your node's repo, only the root node of the source file with be retrieved from the network and linked to from the destination. The remainder of the file will be retrieved on demand.

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

**Example:**

```JavaScript
// To copy a file
await ipfs.files.cp('/src-file', '/dst-file')

// To copy a directory
await ipfs.files.cp('/src-dir', '/dst-dir')

// To copy multiple files to a directory
await ipfs.files.cp('/src-file1', '/src-file2', '/dst-dir')
```

#### `files.mkdir`

> Make a directory.

##### `ipfs.files.mkdir(path, [options])`

Where:

- `path` is the path to the directory to make
- `options` is an optional Object that might contain the following keys:
  - `parents` is a Boolean value to decide whether or not to make the parent directories if they don't exist  (default: false)
  - `format` is what type of nodes to write any newly created directories as (default: `dag-pb`)
  - `hashAlg` is which algorithm to use when creating CIDs for newly created directories (default: `sha2-256`) [The list of all possible values]( https://github.com/multiformats/js-multihash/blob/master/src/constants.js#L5-L343)
  - `flush` is a Boolean value to decide whether or not to immediately flush MFS changes to disk  (default: true)

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

**Example:**

```JavaScript
await ipfs.files.mkdir('/my/beautiful/directory')
```

#### `files.stat`

> Get file or directory status.

##### `ipfs.files.stat(path, [options])`

Where:

- `path` is the path to the file or directory to stat. It might be:
  - An existing MFS path to a file or directory (e.g. `/my-dir/a.txt`)
  - An IPFS path (e.g. `/ipfs/QmWGeRAEgtsHW3ec7U4qW2CyVy7eA2mFRVbk1nb24jFyks`)
  - A [CID][cid] instance (e.g. `new CID('QmWGeRAEgtsHW3ec7U4qW2CyVy7eA2mFRVbk1nb24jFyks')`)
- `options` is an optional Object that might contain the following keys:
  - `hash` is a Boolean value to return only the hash  (default: false)
  - `size` is a Boolean value to return only the size  (default: false)
  - `withLocal` is a Boolean value to compute the amount of the dag that is local, and if possible the total size  (default: false)

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object containing the file/directory status |

the returned object has the following keys:

- `cid` a [CID][cid] instance
- `size` is an integer with the file size in Bytes
- `cumulativeSize` is an integer with the size of the DAGNodes making up the file in Bytes
- `type` is a string that can be either `directory` or `file`
- `blocks` if `type` is `directory`, this is the number of files in the directory. If it is `file` it is the number of blocks that make up the file
- `withLocality` is a boolean to indicate if locality information is present
- `local` is a boolean to indicate if the queried dag is fully present locally
- `sizeLocal` is an integer indicating the cumulative size of the data present locally

**Example:**

```JavaScript
const stats = await ipfs.files.stat('/file.txt')
console.log(stats)

// {
//   hash: CID('QmXmJBmnYqXVuicUfn9uDCC8kxCEEzQpsAbeq1iJvLAmVs'),
//   size: 60,
//   cumulativeSize: 118,
//   blocks: 1,
//   type: 'file'
// }
```

#### `files.rm`

> Remove a file or directory.

##### `ipfs.files.rm(...paths, [options])`

Where:

- `paths` are one or more paths to remove
- `options` is an optional Object that might contain the following keys:
  - `recursive` is a Boolean value to decide whether or not to remove directories recursively  (default: false)

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

**Example:**

```JavaScript
// To remove a file
await ipfs.files.rm('/my/beautiful/file.txt')

// To remove multiple files
await ipfs.files.rm('/my/beautiful/file.txt', '/my/other/file.txt')

// To remove a directory
await ipfs.files.rm('/my/beautiful/directory', { recursive: true })
```

#### `files.read`

> Read a file

##### `ipfs.files.read(path, [options])`

Where:

- `path` is the path of the file to read and must point to a file (and not a directory). It might be:
  - An existing MFS path to a file (e.g. `/my-dir/a.txt`)
  - An IPFS path (e.g. `/ipfs/QmWGeRAEgtsHW3ec7U4qW2CyVy7eA2mFRVbk1nb24jFyks`)
  - A [CID][cid] instance (e.g. `new CID('QmWGeRAEgtsHW3ec7U4qW2CyVy7eA2mFRVbk1nb24jFyks')`)
- `options` is an optional Object that might contain the following keys:
  - `offset` is an Integer with the byte offset to begin reading from  (default: 0)
  - `length` is an Integer with the maximum number of bytes to read (default: Read to the end of stream)

**Returns**

| Type | Description |
| -------- | -------- |
| `AsyncIterable<Buffer>` | An async iterable that yields [`Buffer`][b] objects with the contents of `path` |

**Example:**

```JavaScript
const chunks = []

for await (const chunk of ipfs.files.read('/hello-world')) {
  chunks.push(chunk)
}

console.log(Buffer.concat(chunks).toString())
// Hello, World!
```

#### `files.write`

> Write to a file.

##### `ipfs.files.write(path, content, [options])`

Where:

- `path` is the path of the file to write
- `content` can be:
  - a [`Buffer`][b]
  - an `AsyncIterable` (note: Node.js readable streams are iterable)
  - a [`Blob`][blob] (caveat: will only work in the browser)
  - a string path to a file (caveat: will only work in Node.js)
- `options` is an optional Object that might contain the following keys:
  - `offset` is an Integer with the byte offset to begin writing at (default: 0)
  - `create` is a Boolean to indicate to create the file if it doesn't exist (default: false)
  - `truncate` is a Boolean to indicate if the file should be truncated after writing all the bytes from `content` (default: false)
  - `parents` is a Boolean value to decide whether or not to make the parent directories if they don't exist (default: false)
  - `length` is an Integer with the maximum number of bytes to read (default: Read all bytes from `content`)
  - `rawLeaves`: if true, DAG leaves will contain raw file data and not be wrapped in a protobuf (boolean, default false)
  - `cidVersion`: the CID version to use when storing the data (storage keys are based on the CID, including its version) (integer, default 0)

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

**Example:**

```JavaScript
await ipfs.files.write('/hello-world', Buffer.from('Hello, world!'))
```

#### `files.mv`

> Move files.

##### `ipfs.files.mv(...from, to, [options])`

Where:

- `from` is the path(s) of the source to move
- `to` is the path of the destination to move to
- `options` is an optional Object that might contain the following keys:
  - `parents` is a Boolean value to decide whether or not to make the parent directories if they don't exist (default: false)
  - `format` is what type of nodes to write any newly created directories as (default: `dag-pb`)
  - `hashAlg` is which algorithm to use when creating CIDs for newly created directories (default: `sha2-256`) [The list of all possible values]( https://github.com/multiformats/js-multihash/blob/master/src/constants.js#L5-L343)
  - `flush` is a Boolean value to decide whether or not to immediately flush MFS changes to disk (default: true)

If `from` has multiple values then `to` must be a directory.

If `from` has a single value and `to` exists and is a directory, `from` will be moved into `to`.

If `from` has a single value and `to` exists and is a file, `from` must be a file and the contents of `to` will be replaced with the contents of `from` otherwise an error will be returned.

If `from` is an IPFS path, and an MFS path exists with the same name, the IPFS path will be chosen.

If `from` is an IPFS path and the content does not exist in your node's repo, only the root node of the source file with be retrieved from the network and linked to from the destination. The remainder of the file will be retrieved on demand.

All values of `from` will be removed after the operation is complete unless they are an IPFS path.

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If action is successfully completed. Otherwise an error will be thrown |

**Example:**

```JavaScript
await ipfs.files.mv('/src-file', '/dst-file')

await ipfs.files.mv('/src-dir', '/dst-dir')

await ipfs.files.mv('/src-file1', '/src-file2', '/dst-dir')
```

#### `files.flush`

> Flush a given path's data to the disk

##### `ipfs.files.flush([...paths])`

Where:

- `paths` are optional string paths to flush (default: `/`)

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<void>` | If successfully copied. Otherwise an error will be thrown |

**Example:**

```JavaScript
await ipfs.files.flush('/')
```

#### `files.ls`

> List directories in the local mutable namespace.

##### `ipfs.files.ls([path], [options])`

Where:

- `path` is an optional string to show listing for (default: `/`). It might be:
  - An existing MFS path to a directory (e.g. `/my-dir`)
  - An IPFS path (e.g. `/ipfs/QmWGeRAEgtsHW3ec7U4qW2CyVy7eA2mFRVbk1nb24jFyks`)
  - A [CID][cid] instance (e.g. `new CID('QmWGeRAEgtsHW3ec7U4qW2CyVy7eA2mFRVbk1nb24jFyks')`)
- `options` is an optional Object that might contain the following keys:
  - `sort` is a Boolean value. If true entries will be sorted by filename (default: false)

**Returns**

| Type | Description |
| -------- | -------- |
| `AsyncIterable<Object>` | An async iterable that yields objects representing the files |

Each object contains the following keys:

- `name` which is the file's name
- `type` which is the object's type (`directory` or `file`)
- `size` the size of the file in bytes
- `cid` the hash of the file (A [CID][cid] instance)

**Example:**

```JavaScript
for await (const file of ipfs.files.ls('/screenshots')) {
  console.log(file.name)
}
// 2018-01-22T18:08:46.775Z.png
// 2018-01-22T18:08:49.184Z.png
```

[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/src/files-regular
[b]: https://www.npmjs.com/package/buffer
[file]: https://developer.mozilla.org/en-US/docs/Web/API/File
[cid]: https://www.npmjs.com/package/cids
[blob]: https://developer.mozilla.org/en-US/docs/Web/API/Blob
