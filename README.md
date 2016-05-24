interface-ipfs-core
===================

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)

> A test suite and interface you can use to implement the IPFS Core API.

The primary goal of this module is to define and ensure that both IPFS core implementations and their respective HTTP client libraries offer the same interface, so that developers can quickly change between a local and a remote node without having to change their applications. In addition to the definition of the expected interface, this module offers a suite of tests that can be run in order to check if the interface is used as described.

The API is presented with both Node.js and Go primitives. However, there are no actual limitations keeping it from being extended for any other language, pushing forward cross compatibility and interoperability through different stacks.

# Modules that implement the interface

- **WIP** [JavaScript IPFS implementation](https://github.com/ipfs/js-ipfs)
- **WIP** [JavaScript ipfs-api](https://github.com/ipfs/js-ipfs-api)
- Soon, go-ipfs, go-ipfs-api, java-ipfs-api, python-ipfs-api and others will implement it as well.

Send in a PR if you find or write one!

# Badge

Include this badge in your readme if you make a new module that implements
interface-ipfs-core API.

![](/img/badge.png)

# How to use the battery tests

## Node.js

Install `interface-ipfs-core` as one of the dependencies of your project and as a test file. Then, using `mocha` (for Node.js) or a test runner with compatible API, do:

```
var test = require('interface-ipfs-core')

var common = {
  setup: function (cb) {
    cb(null, yourIPFSInstance)
  },
  teardown: function (cb) {
    cb()
  }
}

// use all of the test suits
test.all(common)
```

## Go

> WIP

# API

A valid (read: that follows this interface) IPFS core implementation, must expose the following API.

## Group Files

### `Add`

> Store a Unixfs file or directory of files .

##### `Go` **WIP**

##### `JavaScript` - ipfs.add(path, [options, callback])

`path` The path to a file to be added to IPFS. Can be of type:

- Callback, If no first argument is supplied a callback will return a duplex stream.
- Path, String format path to a file to be added to IPFS
- Stream
- Object, with format `{ path: </foo/bar>, stream: <readable stream> }`
- Array, an [array] of objects with the above format. 

`options` is a optional argument of type object, that can contain the following properties:

- `Recursive`. Add directory paths recursively.

`callback` must follow `function (err, object) {}` signature, where `err` is an error if the operation was not successful and `object` is an ndjson return with properties { Name (string), Hash (multihash) } 

If no `callback` is passed, a promise is returned.





### `Cat` 

> Displays the data contained by an IPFS object(s) at the given path..

##### `Go` **WIP**

##### `JavaScript` - ipfs.cat(multihash, [callback])

`multihash` is a [multihash]() which can be passed as:

- Buffer, the raw Buffer of the multihash (or of and encoded version)
- String, the toString version of the multihash (or of an encoded version)

`callback` must follow `function (err, stream) {}` signature, where `err` is an error if the operation was not successful and `stream` is a readable stream.

If no `callback` is passed, a promise is returned.





### `Get` 

> Download IPFS UnixFS files and directories with tar archiving and gzip compression options.

##### `Go` **WIP**

##### `JavaScript` - ipfs.get(multihash, [options, callback])

`multihash` is a [multihash]() which can be passed as:

- Buffer, the raw Buffer of the multihash (or of and encoded version)
- String, the toString version of the multihash (or of an encoded version)

`options` is a optional argument of type object, that can contain the following properties:

- `output`, string - The path where output should be stored.
- `archive`, bool   - Output a TAR archive.
- `compress`, bool   - Compress the output with GZIP compression.
- `compression-level` int    - The level of compression (1-9).

`callback` must follow `function (err, ee) {}` signature, where `err` is an error if the operation was not successful and `ee` is an event emitter containing an object of {stream, path, dir} where dir is a boolean flag for a directory path. [ee](https://github.com/ipfs/js-ipfs-unixfs-engine/blob/master/src/exporter.js) // This should be upgraded to duplex object stream.

If no `callback` is passed, a promise is returned.





## Object

### `object.new`

> Create a new MerkleDAG node, using a specific layout. Caveat: So far, only UnixFS object layouts are supported.

##### `Go` **WIP**

##### `JavaScript` - ipfs.object.new([callback])

`callback` must follow `function (err, node) {}` signature, where `err` is an error if the operation was not successful and `node` is a MerkleDAG node of the type [DAGNode][]

If no `callback` is passed, a [promise][] is returned.





### `object.put`

> Store an MerkleDAG node.

##### `Go` **WIP**

##### `JavaScript` - ipfs.object.put(obj, [options, callback])

`obj` is the MerkleDAG Node to be stored. Can of type:

- Object, with format `{ Data: <data>, Links: [] }`
- Buffer, requiring that the encoding is specified on the options. If no encoding is specified, Buffer is treated as the Data field
- [DAGNode][]

`options` is a optional argument of type object, that can contain the following properties:

- `enc`, the encoding of the Buffer (json, yml, etc), if passed a Buffer.

`callback` must follow `function (err, node) {}` signature, where `err` is an error if the operation was not successful and `node` is a MerkleDAG node of the type [DAGNode][]

If no `callback` is passed, a [promise][] is returned.





### `object.get`

> Fetch a MerkleDAG node

##### `Go` **WIP**

##### `JavaScript` - ipfs.object.get(multihash, [options, callback])

`multihash` is a [multihash][] which can be passed as:

- Buffer, the raw Buffer of the multihash (or of and encoded version)
- String, the toString version of the multihash (or of an encoded version)

`options` is a optional argument of type object, that can contain the following properties:

- `enc`, the encoding of multihash (base58, base64, etc), if any.

`callback` must follow `function (err, node) {}` signature, where `err` is an error if the operation was not successful and `node` is a MerkleDAG node of the type [DAGNode][]

If no `callback` is passed, a [promise][] is returned.

### `object.data`

> Returns the Data field of an object

##### `Go` **WIP**

##### `JavaScript` - ipfs.object.data(multihash, [options, callback])
`multihash` is a [multihash][] which can be passed as:

- Buffer, the raw Buffer of the multihash (or of and encoded version)
- String, the toString version of the multihash (or of an encoded version)

`options` is a optional argument of type object, that can contain the following properties:

- `enc`, the encoding of multihash (base58, base64, etc), if any.

`callback` must follow `function (err, data) {}` signature, where `err` is an error if the operation was not successful and `data` is a Buffer with the data that the MerkleDAG node contained.

If no `callback` is passed, a [promise][] is returned.

### `object.links`

> Returns the Links field of an object

##### `Go` **WIP**

##### `JavaScript` - ipfs.object.links(multihash, [options, callback])

`multihash` is a [multihash][] which can be passed as:

- Buffer, the raw Buffer of the multihash (or of and encoded version)
- String, the toString version of the multihash (or of an encoded version)

`options` is a optional argument of type object, that can contain the following properties:

- `enc`, the encoding of multihash (base58, base64, etc), if any.

`callback` must follow `function (err, links) {}` signature, where `err` is an error if the operation was not successful and `links` is an Array of [DAGLink](https://github.com/vijayee/js-ipfs-merkle-dag/blob/master/src/dag-node.js#L199-L203) objects.

If no `callback` is passed, a [promise][] is returned.





### `object.stat`

> Returns stats about an Object

##### `Go` **WIP**

##### `JavaScript` - ipfs.object.stat(multihash, [options, callback])

`multihash` is a [multihash][] which can be passed as:

- Buffer, the raw Buffer of the multihash (or of and encoded version)
- String, the toString version of the multihash (or of an encoded version)

`options` is a optional argument of type object, that can contain the following properties:

- `enc`, the encoding of multihash (base58, base64, etc), if any.

`callback` must follow `function (err, stats) {}` signature, where `err` is an error if the operation was not successful and `stats` is an Object with following format:

```JavaScript
{
  Hash: 'QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD',
  NumLinks: 0,
  BlockSize: 10,
  LinksSize: 2,
  DataSize: 8,
  CumulativeSize: 10
}
```

If no `callback` is passed, a [promise][] is returned.





### `object.patch`

> `object.patch` exposes the available patch calls.

#### `object.patch.addLink`

> Add a Link to an existing MerkleDAG Object

##### `Go` **WIP**

##### `JavaScript` - ipfs.object.patch.addLink(multihash, DAGLink, [options, callback])

`multihash` is a [multihash][] which can be passed as:

- Buffer, the raw Buffer of the multihash (or of and encoded version)
- String, the toString version of the multihash (or of an encoded version)

`DAGLink` is the new link to be added on the node that is identified by the `multihash`

`options` is a optional argument of type object, that can contain the following properties:

- `enc`, the encoding of multihash (base58, base64, etc), if any.

`callback` must follow `function (err, node) {}` signature, where `err` is an error if the operation was not successful and `node` is a MerkleDAG node of the type [DAGNode][] that resulted by the operation of adding a Link.

If no `callback` is passed, a [promise][] is returned.





#### `object.patch.rmLink`

> Remove a Link from an existing MerkleDAG Object

##### `Go` **WIP**

##### `JavaScript` - ipfs.object.patch.rmLink(multihash, DAGLink, [options, callback])

`multihash` is a [multihash][] which can be passed as:

- Buffer, the raw Buffer of the multihash (or of and encoded version)
- String, the toString version of the multihash (or of an encoded version)

`DAGLink` is the link to be removed on the node that is identified by the `multihash`

`options` is a optional argument of type object, that can contain the following properties:

- `enc`, the encoding of multihash (base58, base64, etc), if any.

`callback` must follow `function (err, node) {}` signature, where `err` is an error if the operation was not successful and `node` is a MerkleDAG node of the type [DAGNode][] that resulted by the operation of adding a Link.

If no `callback` is passed, a [promise][] is returned.





#### `object.patch.appendData`

> Append Data to the Data field of an existing node.

##### `Go` **WIP**

##### `JavaScript` - ipfs.object.patch.appendData(multihash, data, [options, callback])

`multihash` is a [multihash][] which can be passed as:

- Buffer, the raw Buffer of the multihash (or of and encoded version)
- String, the toString version of the multihash (or of an encoded version)

`data` is a Buffer containing Data to be appended to the existing node.

`options` is a optional argument of type object, that can contain the following properties:

- `enc`, the encoding of multihash (base58, base64, etc), if any.

`callback` must follow `function (err, node) {}` signature, where `err` is an error if the operation was not successful and `node` is a MerkleDAG node of the type [DAGNode][] that resulted by the operation of adding a Link.

If no `callback` is passed, a [promise][] is returned.





#### `object.patch.setData`

> Reset the Data field of a MerkleDAG Node to new Data

##### `Go` **WIP**

##### `JavaScript` - ipfs.object.patch.setData(multihash, data, [options, callback])

`multihash` is a [multihash][] which can be passed as:

- Buffer, the raw Buffer of the multihash (or of and encoded version)
- String, the toString version of the multihash (or of an encoded version)

`data` is a Buffer containing Data to replace the existing Data on the node.

`options` is a optional argument of type object, that can contain the following properties:

- `enc`, the encoding of multihash (base58, base64, etc), if any.

`callback` must follow `function (err, node) {}` signature, where `err` is an error if the operation was not successful and `node` is a MerkleDAG node of the type [DAGNode][] that resulted by the operation of adding a Link.

If no `callback` is passed, a [promise][] is returned.


[DAGNode]: https://github.com/vijayee/js-ipfs-merkle-dag
[multihash]: http://github.com/jbenet/multihash
[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
