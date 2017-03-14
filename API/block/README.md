block API
=========

#### `get`

> Get a raw IPFS block.

##### `Go` **WIP**

##### `JavaScript` - ipfs.block.get(cid, [options, callback])

`cid` is a [cid][cid] which can be passed as:

- Buffer, the raw Buffer of the cid
- CID, a CID instance
- String, the base58 encoded version of the multihash

`callback` must follow `function (err, block) {}` signature, where `err` is an error if the operation was not successful and `block` is a [Block][block] type object, containing both the data and the hash of the block.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.block.get(cid, function (err, block) {
  if (err) {
    throw err
  }
  block.key((err, key) => {
    if (err) {
      throw err
    }
    console.log(key, block.data)
  })
})
```

A great source of [examples][] can be found in the tests for this API.

#### `put`

> Stores input as an IPFS block.

##### `Go` **WIP**

##### `JavaScript` - ipfs.block.put(block, cid, [callback])

Where `block` can be:

- `Buffer` - the raw bytes of the Block
- [`Block`][block] instance

`cid` is a [cid][cid] which can be passed as:

- Buffer, the raw Buffer of the cid
- CID, a CID instance
- String, the base58 encoded version of the multihash

`callback` has the signature `function (err, block) {}`, where `err` is an error if the operation was not successful and `block` is a [Block][block] type object, containing both the data and the hash of the block.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
const CID = require('cids')
const buf = new Buffer('a serialized object')
const cid = new CID(1, 'dag-pb', multihash)

ipfs.block.put(blob, cid, (err, block) => {
  if (err) {
    throw err
  }
  // Block hsa been stored

  console.log(block.data.toString())
  // Logs:
  // a serialized object
})
```

A great source of [examples][] can be found in the tests for this API.

#### `stat`

> Print information of a raw IPFS block.

##### `Go` **WIP**

##### `JavaScript` - ipfs.block.stat(cid, [callback])

`cid` is a [cid][cid] which can be passed as:

- `Buffer`, the raw Buffer of the multihash (or of and encoded version)
- `String`, the toString version of the multihash (or of an encoded version)
- CID, a CID instance

`callback` must follow the signature `function (err, stats) {}`, where `err` is an error if the operation was not successful and `stats` is an object with the format:`

```JavaScript
{
  cid: 'QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD',
  size: 10
}
```

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
const multihashStr = 'QmQULBtTjNcMwMr4VMNknnVv3RpytrLSdgpvMcTnfNhrBJ'
const cid = new CID(multihashStr)

ipfs.block.stat(cid, (err, stats) => {
  if (err) {
    throw err
  }
  console.log(stats)
  // Logs:
  // {
  //   key: QmQULBtTjNcMwMr4VMNknnVv3RpytrLSdgpvMcTnfNhrBJ,
  /    size: 3739
  // }
})
```

A great source of [examples][] can be found in the tests for this API.

[block]:https://github.com/ipfs/js-ipfs-block
[multihash]:https://github.com/multiformats/multihash
[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/src/block.js
