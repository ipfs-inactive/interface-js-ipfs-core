dag API
=======

> The dag API comes to replace the `object API`, it support the creation and manipulation of dag-pb object, as well as other IPLD formats (i.e dag-cbor, ethereum-block, git, etc)

#### `dag.put`

> Store an IPLD format node

##### `Go` **WIP**

##### `JavaScript` - ipfs.dag.put(dagNode, options, callback)

- `dagNode` - a DAG node that follows one of the supported IPLD formats.
- `options` - a object that might contain the follwing values:
    - `format` - The IPLD format multicodec.
    - `hashAlg` - The hash algorithm to be used over the serialized dagNode.
  - or
    - `cid` - the CID of the node passed.
  - **Note** - You should only pass the CID or the format + hashAlg pair and not both
- `callback` must follow `function (err, cid) {}` signature, where `err` is an error if the operation was not successful and CID is the CID generated through the process or the one that was passed

If no `callback` is passed, a [promise][] is returned.

**Example:**

```JavaScript
```

#### `dag.get`

> Retrieve an IPLD format node

##### `Go` **WIP**

##### `JavaScript` - ipfs.dag.get(cid [, path, options], callback)

- `cid` - can be one of the following:
  - a [CID](https://github.com/ipfs/js-cid) instance.
  - a CID in its String format (i.e: zdpuAkxd9KzGwJFGhymCZRkPCXtBmBW7mB2tTuEH11HLbES9Y)
  - a CID in its String format concatenated with the path to be resolved
- `path` - the path to be resolved. Optional.
- `options` - a object that might contain the following values:
  - `localResolve` - bool - if set to true, it will avoid resolving through different objects.

`callback` must follow `function (err, result) {}` signature, where `err` is an error if the operation was not successful and `result` is an object containing:

- `value` - the value or node that was fetched during the get operation.
- `remainderPath` - The remainder of the Path that the node was unable to resolve or what was left in a localResolve scenario.

If no `callback` is passed, a [promise][] is returned.

**Example:**

```JavaScript
```
