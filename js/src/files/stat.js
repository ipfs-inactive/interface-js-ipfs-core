/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const loadFixture = require('aegir/fixtures')
const expect = chai.expect
chai.use(dirtyChai)
const { getDescribe, getIt } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.files.stat', function () {
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

    it('should not stat not found, expect error', function (done) {
      ipfs.files.stat('/test/404', (err) => {
        expect(err).to.exist()
        done()
      })
    })

    it('should stat file', function (done) {
      ipfs.files.stat('/test/b', (err, stat) => {
        expect(err).to.not.exist()
        expect(stat).to.eql({
          type: 'file',
          blocks: 1,
          size: 13,
          hash: 'QmcZojhwragQr5qhTeFAmELik623Z21e3jBTpJXoQ9si1T',
          cumulativeSize: 71,
          withLocality: false,
          local: undefined,
          sizeLocal: undefined
        })
        done()
      })
    })

    it('should stat dir', function (done) {
      ipfs.files.stat('/test', (err, stat) => {
        expect(err).to.not.exist()
        expect(stat).to.eql({
          type: 'directory',
          blocks: 2,
          size: 0,
          hash: 'QmVrkkNurBCeJvPRohW5JTvJG4AxGrFg7FnmsZZUS6nJto',
          cumulativeSize: 216,
          withLocality: false,
          local: undefined,
          sizeLocal: undefined
        })
        done()
      })
    })

    // TODO enable this test when this feature gets released on go-ipfs
    it.skip('should stat withLocal file', function (done) {
      ipfs.files.stat('/test/b', {withLocal: true}, (err, stat) => {
        expect(err).to.not.exist()
        expect(stat).to.eql({
          type: 'file',
          blocks: 1,
          size: 13,
          hash: 'QmcZojhwragQr5qhTeFAmELik623Z21e3jBTpJXoQ9si1T',
          cumulativeSize: 71,
          withLocality: true,
          local: true,
          sizeLocal: 71
        })
        done()
      })
    })

    // TODO enable this test when this feature gets released on go-ipfs
    it.skip('should stat withLocal dir', function (done) {
      ipfs.files.stat('/test', {withLocal: true}, (err, stat) => {
        expect(err).to.not.exist()
        expect(stat).to.eql({
          type: 'directory',
          blocks: 2,
          size: 0,
          hash: 'QmVrkkNurBCeJvPRohW5JTvJG4AxGrFg7FnmsZZUS6nJto',
          cumulativeSize: 216,
          withLocality: true,
          local: true,
          sizeLocal: 216
        })
        done()
      })
    })

    // TODO: (achingbrain) - Not yet supported in js-ipfs or go-ipfs yet')
    it.skip('should stat outside of mfs', function (done) {
      ipfs.files.stat('/ipfs/' + smallFile.cid, (err, stat) => {
        expect(err).to.not.exist()
        expect(stat).to.eql({
          type: 'file',
          blocks: 0,
          size: 12,
          hash: 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP',
          cumulativeSize: 20,
          withLocality: false,
          local: undefined,
          sizeLocal: undefined
        })
        done()
      })
    })
  })
}
