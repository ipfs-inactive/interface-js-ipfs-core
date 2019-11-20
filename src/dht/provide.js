/* eslint-env mocha */
'use strict'

const CID = require('cids')
const { spawnNodesWithId } = require('../utils/spawn')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { connect } = require('../utils/swarm')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.dht.provide', function () {
    this.timeout(80 * 1000)

    let ipfs

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()

        spawnNodesWithId(2, factory, (err, nodes) => {
          expect(err).to.not.exist()
          ipfs = nodes[0]
          connect(ipfs, nodes[1].peerId.addresses[0], done)
        })
      })
    })

    after(function (done) {
      this.timeout(50 * 1000)

      common.teardown(done)
    })

    it('should provide local CID', async () => {
      const res = await ipfs.add(Buffer.from('test'))

      await ipfs.dht.provide(new CID(res[0].hash))
    })

    it('should not provide if block not found locally', () => {
      const cid = new CID('Qmd7qZS4T7xXtsNFdRoK1trfMs5zU94EpokQ9WFtxdPxsZ')

      return expect(ipfs.dht.provide(cid)).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
        .and.have.property('message')
        .that.include('not found locally')
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

    it('should error on non CID arg', () => {
      return expect(ipfs.dht.provide({})).to.eventually.be.rejected()
    })

    it('should error on array containing non CID arg', () => {
      return expect(ipfs.dht.provide([{}])).to.eventually.be.rejected()
    })
  })
}
