/* eslint max-nested-callbacks: ["error", 5] */
/* eslint-env mocha */
'use strict'

const PeerId = require('peer-id')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.name.pubsub.cancel', function () {
    let ipfs
    let nodeId

    before(async () => {
      ipfs = await common.setup()
      nodeId = ipfs.peerId.id
    })

    after(() => common.teardown())

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

      let res

      res.subs1 = await ipfs.name.pubsub.subs()
      res.cancel = await ipfs.name.pubsub.cancel(ipnsPath)
      res.subs2 = await ipfs.name.pubsub.subs()

      expect(res.subs1).to.be.an('array').that.does.include(ipnsPath)
      expect(res.cancel).to.have.property('canceled')
      expect(res.cancel.canceled).to.eql(true)
      expect(res.subs2).to.be.an('array').that.does.not.include(ipnsPath)
    })
  })
}
