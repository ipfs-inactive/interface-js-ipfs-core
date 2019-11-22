/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.stop', function () {
    this.timeout(60 * 1000)
    let ipfs

    before(async () => {
      ipfs = await common.setup()
    })

    // must be last test to run
    it('should stop the node', async function () {
      this.timeout(10 * 1000)

      await ipfs.stop()

      // Trying to stop an already stopped node should return an error
      // as the node can't respond to requests anymore
      return expect(ipfs.stop()).to.eventually.be.rejected()
    })
  })
}
