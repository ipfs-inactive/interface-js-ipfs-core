/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 6] */
'use strict'

const pTimes = require('p-times')
const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.key.list', () => {
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

    it('should list all the keys', async function () {
      this.timeout(60 * 1000)

      const keys = await pTimes(3, () => ipfs.key.gen(hat(), { type: 'rsa', size: 2048 }), { concurrency: 1 })

      const res = await ipfs.key.list()
      expect(res).to.exist()
      expect(res).to.be.an('array')
      expect(res.length).to.be.above(keys.length - 1)

      keys.forEach(key => {
        const found = res.find(({ id, name }) => name === key.name && id === key.id)
        expect(found).to.exist()
      })
    })
  })
}
