/* eslint max-nested-callbacks: ["error", 5] */
/* eslint-env mocha */
'use strict'

const PeerId = require('peer-id')

const { spawnNodeWithId } = require('../utils/spawn')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.name.pubsub.cancel', function () {
    let ipfs
    let nodeId

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()

        spawnNodeWithId(factory, (err, node) => {
          expect(err).to.not.exist()

          ipfs = node
          nodeId = node.peerId.id

          done()
        })
      })
    })

    after((done) => common.teardown(done))

    it('should return false when the name that is intended to cancel is not subscribed', async function () {
      this.timeout(60 * 1000)

      const res = await ipfs.name.pubsub.cancel(nodeId)
      expect(res).to.exist()
      expect(res).to.have.property('canceled')
      expect(res.canceled).to.eql(false)
    })

    it('should cancel a subscription correctly returning true', async function () {
      this.timeout(300 * 1000)

      const peerId = await PeerId.create({ bits: 512 })

      const id = peerId.toB58String()
      const ipnsPath = `/ipns/${id}`

      const subs = await ipfs.name.pubsub.subs()
      expect(subs).to.be.an('array').that.does.not.include(ipnsPath)

      await expect(ipfs.name.resolve(id)).to.be.rejected()

      const subs1 = await ipfs.name.pubsub.subs()
      const cancel = await ipfs.name.pubsub.cancel(ipnsPath)
      const subs2 = await ipfs.name.pubsub.subs()

      expect(subs1).to.be.an('array').that.does.include(ipnsPath)
      expect(cancel).to.have.property('canceled')
      expect(cancel.canceled).to.eql(true)
      expect(subs2).to.be.an('array').that.does.not.include(ipnsPath)
    })
  })
}
