# Bitswap API

* [bitswap.wantlist](#bitswapwantlist)
* [bitswap.stat](#bitswapstat)

### `bitswap.wantlist`

> Get the list of wanted CIDs for this peer or another peer on the network.

#### Go **WIP**

#### JavaScript - `ipfs.bitswap.wantlist([peerId])`

##### Parameters

| Name | Type | Description |
|------|------|-------------|
| peerId | `String` | (optional) Base 58 encoded Peer ID to get the wantlist for. Default: this node's peer ID |

##### Returns

| Type | Description |
|------|-------------|
| `Promise<{`<br/>&nbsp;&nbsp;`Keys<Array<Object>>`<br/>`}>` | The list of CIDs wanted by the peer. Each object in the array has a single property "/" a string CID. |

##### Example

```js
const list = await ipfs.bitswap.wantlist()
console.log(list) // { Keys: [{ '/': 'QmHash' }] }
```

Wantlist for a given peer:

```js
ipfs.bitswap.wantlist('QmZEYeEin6wEB7WNyiT7stYTmbYFGy7BzM7T3hRDzRxTvY')
console.log(list) // { Keys: [{ '/': 'QmHash' }] }
```

#### `bitswap.stat`

> Show diagnostic information on the bitswap agent.

##### Go **WIP**

##### JavaScript - `ipfs.bitswap.stat()`

Note: `bitswap.stat` and `stats.bitswap` can be used interchangeably.

##### Returns

| Type | Description |
|------|-------------|
| `Promise<{`<br/>&nbsp;&nbsp;`provideBufLen<Number>,`<br/>&nbsp;&nbsp;`wantlist<Array<Object>>,`<br/>&nbsp;&nbsp;`peers<Array<String>>,`<br/>&nbsp;&nbsp;`blocksReceived<`[`Big`][1]`>,`<br/>&nbsp;&nbsp;`dataReceived<`[`Big`][1]`>,`<br/>&nbsp;&nbsp;`blocksSent<`[`Big`][1]`>,`<br/>&nbsp;&nbsp;`dataSent<`[`Big`][1]`>,`<br/>&nbsp;&nbsp;`dupBlksReceived<`[`Big`][1]`>,`<br/>&nbsp;&nbsp;`dupDataReceived<`[`Big`][1]`>,`<br/>`}>` | Diagnostic information on the bitswap agent |

##### Example

```js
const stats = await ipfs.bitswap.stat()
console.log(stats)
// { provideBufLen: 0,
//   wantlist: [ { '/': 'QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM' } ],
//   peers:
//    [ 'QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM',
//      'QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
//      'QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd' ],
//   blocksReceived: 0,
//   dataReceived: 0,
//   blocksSent: 0,
//   dataSent: 0,
//   dupBlksReceived: 0,
//  dupDataReceived: 0 }
```

[1]: https://github.com/MikeMcl/big.js/
