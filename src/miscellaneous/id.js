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

    before(async () => {
      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should get the node ID', async () => {
      const res = await ipfs.id()
      expect(res).to.have.a.property('id')
      expect(res).to.have.a.property('publicKey')
    })
  })
}
