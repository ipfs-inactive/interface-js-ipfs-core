/* eslint-env mocha */
'use strict'

const CID = require('cids')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.dht.provide', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(async () => {
      ipfs = await common.setup()
      const nodeB = await common.setup()
      await ipfs.swarm.connect(nodeB.peerId.addresses[0])
    })

    after(() => common.teardown())

    it('should provide local CID', async () => {
      const res = await ipfs.add(Buffer.from('test'))

      await ipfs.dht.provide(new CID(res[0].hash))
    })

    it('should not provide if block not found locally', async () => {
      const cid = new CID('Qmd7qZS4T7xXtsNFdRoK1trfMs5zU94EpokQ9WFtxdPxsZ')

      try {
        await ipfs.dht.provide(cid)
        expect.fail('dht.provide() did not throw when block is not found locally')
      } catch (err) {
        expect(err).to.exist()
        expect(err.message).to.include('not found locally')
      }
    })

    it('should allow multiple CIDs to be passed', async () => {
      const res = await ipfs.add([
        { content: Buffer.from('t0') },
        { content: Buffer.from('t1') }
      ])

      await ipfs.dht.provide([
        new CID(res[0].hash),
        new CID(res[1].hash)
      ])
    })

    it('should provide a CIDv1', async () => {
      const res = await ipfs.add(Buffer.from('test'), { cidVersion: 1 })

      const cid = new CID(res[0].hash)

      await ipfs.dht.provide(cid)
    })

    it('should error on non CID arg', async () => {
      try {
        await ipfs.dht.provide({})
        expect.fail('ipfs.dht.provide() did not throw on non CID arg')
      } catch (err) {
        expect(err).to.exist()
      }
    })

    it('should error on array containing non CID arg', async () => {
      try {
        await ipfs.dht.provide([{}])
        expect.fail('ipfs.dht.provide() did not throw on array containing non CID arg')
      } catch (err) {
        expect(err).to.exist()
      }
    })
  })
}
