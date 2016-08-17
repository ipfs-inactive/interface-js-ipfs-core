block API
=========

#### `get`

> Get a raw IPFS block.

##### `Go` **WIP**

##### `JavaScript` - ipfs.block.get(multihash, [options, callback])

`multihash` is a [multihash][multihash] which can be passed as:

- Buffer, the raw Buffer of the multihash
- String, the base58 encoded version of the multihash

`callback` must follow `function (err, block) {}` signature, where `err` is an error if the operation was not successful and `block` is a [Block][block] type object, containing both the data and the hash of the block.

```js
ipfs.block.get(multihash, function (err, block) {
  if (err) {
    throw err
  }
  console.log(block.key, block.data)
})
```

If no `callback` is passed, a promise is returned.


#### `getStream`

> Get a raw IPFS block as a stream.

##### `Go` **WIP**

##### `JavaScript` - ipfs.block.getStream(multihash, [options])

`multihash` is a [multihash][multihash] which can be passed as:

- Buffer, the raw Buffer of the multihash
- String, the base58 encoded version of the multihash

Returns a readable [pull-stream](pull-stream) of [Block][block]s

```js
pull(
  ipfs.block.get(multihash)
  pull.log()
)
```

#### `put`

> Stores input as an IPFS block.

##### `Go` **WIP**

##### `JavaScript` - ipfs.block.put(block, [callback])

Where `block` can be:

- `Buffer` - the raw bytes of the Block
- [`Block`][block] instance

`callback` has the signature `function (err, block) {}`, where `err` is an error if the operation was not successful and `block` is a [Block][block] type object, containing both the data and the hash of the block.

If no `callback` is passed, a promise is returned.


#### `putStream`

> Stores input as an IPFS block.

##### `Go` **WIP**

##### `JavaScript` - ipfs.block.putStream()

Returns a duplex [pull-stream](pull-stream).

```js
const b1 = new Block('hello')
const b2 = new Block('world')

pull(
  pull.values([b1, bw]),
  ipfs.block.putStream()
)
```

#### `stat`

> Print information of a raw IPFS block.

##### `Go` **WIP**

##### `JavaScript` - ipfs.block.stat(multihash, [callback])

`multihash` is a [multihash][multihash] which can be passed as:

- `Buffer`, the raw Buffer of the multihash (or of and encoded version)
- `String`, the toString version of the multihash (or of an encoded version)

`callback` must follow the signature `function (err, stats) {}`, where `err` is an error if the operation was not successful and `stats` is an object with the format:`

```JavaScript
{
  Key: 'QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD',
  Size: 10
}
```

If no `callback` is passed, a promise is returned.

[block](https://github.com/ipfs/js-ipfs-block)
[multihash](https://github.com/multiformats/multihash)
[pull-stream](https://pull-stream.github.io)
