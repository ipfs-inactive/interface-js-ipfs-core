/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const loadFixture = require('aegir/fixtures')
const pull = require('pull-stream')
const { getDescribe, getIt } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.files.catPullStream', function () {
    this.timeout(40 * 1000)

    let ipfs

    const smallFile = {
      cid: 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP',
      data: loadFixture('js/test/fixtures/testfile.txt', 'interface-ipfs-core')
    }

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

    before((done) => ipfs.files.add(smallFile.data, done))

    after((done) => common.teardown(done))

    it('should return a Pull Stream for a CID', (done) => {
      const stream = ipfs.files.catPullStream(smallFile.cid)

      pull(
        stream,
        pull.concat((err, data) => {
          expect(err).to.not.exist()
          expect(data.length).to.equal(smallFile.data.length)
          expect(data).to.eql(smallFile.data.toString())
          done()
        })
      )
    })

    it('should export a chunk of a file in a Pull Stream', (done) => {
      const offset = 1
      const length = 3

      const stream = ipfs.files.catPullStream(smallFile.cid, {
        offset,
        length
      })

      pull(
        stream,
        pull.concat((err, data) => {
          expect(err).to.not.exist()
          expect(data.toString()).to.equal('lz ')
          done()
        })
      )
    })
  })
}
