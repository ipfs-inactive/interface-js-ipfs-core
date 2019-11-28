/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.config.replace', function () {
    this.timeout(30 * 1000)
    let ipfs

    before(async function () {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      ipfs = await common.setup()
    })

    after(() => common.teardown())

    const config = {
      Fruit: 'Bananas'
    }

    it('should replace the whole config', async () => {
      await ipfs.config.replace(config)

      const _config = await ipfs.config.get()
      expect(_config).to.deep.equal(config)
    })

    it('should replace to empty config', async () => {
      await ipfs.config.replace({})

      const _config = await ipfs.config.get()
      expect(_config).to.deep.equal({})
    })
  })
}
