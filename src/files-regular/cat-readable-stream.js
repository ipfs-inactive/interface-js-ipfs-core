/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const getStream = require('get-stream')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.catReadableStream', function () {
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

    before((done) => ipfs.add(fixtures.bigFile.data, done))
    before((done) => ipfs.add(fixtures.smallFile.data, done))

    after((done) => common.teardown(done))

    it('should return a Readable Stream for a CID', async () => {
      const stream = ipfs.catReadableStream(fixtures.bigFile.cid)
      const data = await getStream.buffer(stream)

      expect(data).to.eql(fixtures.bigFile.data)
    })

    it('should export a chunk of a file in a Readable Stream', async () => {
      const offset = 1
      const length = 3

      const stream = ipfs.catReadableStream(fixtures.smallFile.cid, {
        offset,
        length
      })

      const data = await getStream.buffer(stream)
      expect(data.toString()).to.equal('lz ')
    })
  })
}
