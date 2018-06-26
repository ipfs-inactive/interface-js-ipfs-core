/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.repo.gc', () => {
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

    after((done) => common.teardown(done))

    it('should run garbage collection', (done) => {
      ipfs.repo.gc((err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()
        done()
      })
    })

    it('should run garbage collection (promised)', () => {
      return ipfs.repo.gc().then((res) => {
        expect(res).to.exist()
      })
    })
  })
}
