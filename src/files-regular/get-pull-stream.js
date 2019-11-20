/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const pullToPromise = require('pull-to-promise')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.getPullStream', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist()
          ipfs = node
          done()
        })
      })
    })

    before(() => ipfs.add(fixtures.smallFile.data))

    after((done) => common.teardown(done))

    it('should return a Pull Stream of Pull Streams', async () => {
      const stream = ipfs.getPullStream(fixtures.smallFile.cid)

      const files = await pullToPromise.any(stream)

      const data = Buffer.concat(await pullToPromise.any(files[0].content))
      expect(data.toString()).to.contain('Plz add me!')
    })
  })
}
