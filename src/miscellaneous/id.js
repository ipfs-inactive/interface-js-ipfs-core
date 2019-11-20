/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.id', function () {
    this.timeout(60 * 1000)
    let ipfs

    before(function (done) {
      common.setup((err, factory) => {
        expect(err).to.not.exist()
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist()
          ipfs = node
          done()
        })
      })
    })

    after((done) => {
      common.teardown(done)
    })

    it('should get the node ID', async () => {
      const res = await ipfs.id()
      expect(res).to.have.a.property('id')
      expect(res).to.have.a.property('publicKey')
    })
  })
}
