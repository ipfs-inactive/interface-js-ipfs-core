/* eslint max-nested-callbacks: ["error", 5] */
/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl").TestsInterface } TestsInterface */
/**
 * @param {TestsInterface} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.name.pubsub.subs', function () {
    let ipfs

    before(async () => {
      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should get an empty array as a result of subscriptions before any resolve', async function () {
      this.timeout(60 * 1000)

      const res = await ipfs.name.pubsub.subs()
      expect(res).to.exist()
      expect(res).to.eql([])
    })

    it('should get the list of subscriptions updated after a resolve', async function () {
      this.timeout(300 * 1000)
      const id = 'QmNP1ASen5ZREtiJTtVD3jhMKhoPb1zppET1tgpjHx2NGA'

      const res = await ipfs.name.pubsub.subs()
      expect(res).to.eql([]) // initally empty

      try {
        await ipfs.name.resolve(id)
        expect.fail('name.resolve() did not throw as expected')
      } catch (err) {
        expect(err).to.exist()

        const res = await ipfs.name.pubsub.subs()
        expect(res).to.be.an('array').that.does.include(`/ipns/${id}`)
      }
    })
  })
}
