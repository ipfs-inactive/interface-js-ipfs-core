/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.key.rm', () => {
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

    it('should rm a key', function (done) {
      this.timeout(30 * 1000)

      ipfs.key.gen(hat(), { type: 'rsa', size: 2048 }, (err, key) => {
        expect(err).to.not.exist()

        ipfs.key.rm(key.name, (err, res) => {
          expect(err).to.not.exist()
          expect(res).to.exist()
          expect(res).to.have.property('name', key.name)
          expect(res).to.have.property('id', key.id)

          ipfs.key.list((err, res) => {
            expect(err).to.not.exist()
            expect(res.find(k => k.name === key.name)).to.not.exist()
            done()
          })
        })
      })
    })
  })
}
