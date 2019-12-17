/* eslint-env mocha */
'use strict'

const hat = require('hat')
const all = require('it-all')
const { fixtures } = require('../utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.files.stat', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = (await common.spawn()).api })
    before(async () => { await all(ipfs.add(fixtures.smallFile.data)) })

    after(() => common.clean())

    it('should not stat not found file/dir, expect error', function () {
      const testDir = `/test-${hat()}`

      return expect(ipfs.files.stat(`${testDir}/404`)).to.eventually.be.rejected()
    })

    it('should stat file', async function () {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(testDir, { parents: true })
      await ipfs.files.write(`${testDir}/b`, Buffer.from('Hello, world!'), { create: true })

      const stat = await ipfs.files.stat(`${testDir}/b`)
      stat.cid = stat.cid.toString()

      expect(stat).to.include({
        type: 'file',
        blocks: 1,
        size: 13,
        cid: 'QmcZojhwragQr5qhTeFAmELik623Z21e3jBTpJXoQ9si1T',
        cumulativeSize: 71,
        withLocality: false
      })
      expect(stat.local).to.be.undefined()
      expect(stat.sizeLocal).to.be.undefined()
    })

    it('should stat dir', async function () {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(testDir, { parents: true })
      await ipfs.files.write(`${testDir}/a`, Buffer.from('Hello, world!'), { create: true })

      const stat = await ipfs.files.stat(testDir)
      stat.cid = stat.cid.toString()

      expect(stat).to.include({
        type: 'directory',
        blocks: 1,
        size: 0,
        cid: 'QmQGn7EvzJZRbhcwHrp4UeMeS56WsLmrey9JhfkymjzXQu',
        cumulativeSize: 118,
        withLocality: false
      })
      expect(stat.local).to.be.undefined()
      expect(stat.sizeLocal).to.be.undefined()
    })

    // TODO enable this test when this feature gets released on go-ipfs
    it.skip('should stat withLocal file', async function () {
      const stat = await ipfs.files.stat('/test/b', { withLocal: true })
      stat.cid = stat.cid.toString()

      expect(stat).to.eql({
        type: 'file',
        blocks: 1,
        size: 13,
        cid: 'QmcZojhwragQr5qhTeFAmELik623Z21e3jBTpJXoQ9si1T',
        cumulativeSize: 71,
        withLocality: true,
        local: true,
        sizeLocal: 71
      })
    })

    // TODO enable this test when this feature gets released on go-ipfs
    it.skip('should stat withLocal dir', async function () {
      const stat = await ipfs.files.stat('/test', { withLocal: true })
      stat.cid = stat.cid.toString()

      expect(stat).to.eql({
        type: 'directory',
        blocks: 2,
        size: 0,
        cid: 'QmVrkkNurBCeJvPRohW5JTvJG4AxGrFg7FnmsZZUS6nJto',
        cumulativeSize: 216,
        withLocality: true,
        local: true,
        sizeLocal: 216
      })
    })

    it('should stat outside of mfs', async () => {
      const stat = await ipfs.files.stat('/ipfs/' + fixtures.smallFile.cid)
      stat.cid = stat.cid.toString()

      expect(stat).to.include({
        type: 'file',
        blocks: 0,
        size: 12,
        cid: fixtures.smallFile.cid,
        cumulativeSize: 20,
        withLocality: false
      })
      expect(stat.local).to.be.undefined()
      expect(stat.sizeLocal).to.be.undefined()
    })
  })
}
