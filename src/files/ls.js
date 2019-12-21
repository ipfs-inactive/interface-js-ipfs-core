/* eslint-env mocha */
'use strict'

const hat = require('hat')
const all = require('it-all')
const CID = require('cids')
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

  describe('.files.ls', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = (await common.spawn()).api })

    after(() => common.clean())

    it('should not ls not found file/dir, expect error', () => {
      const testDir = `/test-${hat()}`

      return expect(all(ipfs.files.ls(`${testDir}/404`))).to.eventually.be.rejected()
    })

    it('should ls directory', async () => {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(`${testDir}/lv1`, { parents: true })
      await ipfs.files.write(`${testDir}/b`, Buffer.from('Hello, world!'), { create: true })

      const info = await all(ipfs.files.ls(testDir))

      const expectedListing = [{
        name: 'b',
        type: 0,
        size: 13,
        cid: new CID('QmcZojhwragQr5qhTeFAmELik623Z21e3jBTpJXoQ9si1T')
      }, {
        name: 'lv1',
        type: 1,
        size: 0,
        cid: new CID('QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn')
      }]

      info.sort((a, b) => a.name.localeCompare(b.name)).forEach((f, i) => {
        expect(f.name).to.equal(expectedListing[i].name)
        expect(f.type).to.equal(expectedListing[i].type)
        expect(f.size).to.equal(expectedListing[i].size)
        expect(f.cid.toString()).to.equal(expectedListing[i].cid.toString())
      })
    })

    it('should ls from outside of mfs', async () => {
      const testFileName = hat()
      const [{
        cid
      }] = await all(ipfs.add({ path: `/test/${testFileName}`, content: fixtures.smallFile.data }))
      const listing = await all(ipfs.files.ls('/ipfs/' + cid))
      expect(listing).to.have.length(1)
      expect(listing[0].name).to.equal(cid.toString())
    })

    it('should list an empty directory', async () => {
      const testDir = `/test-${hat()}`
      await ipfs.files.mkdir(testDir)
      const contents = await all(ipfs.files.ls(testDir))

      expect(contents).to.be.an('array').and.to.be.empty()
    })

    it('should list an file directly', async () => {
      const fileName = `single-file-${hat()}.txt`
      const filePath = `/${fileName}`
      await ipfs.files.write(filePath, Buffer.from('Hello world'), {
        create: true
      })
      const contents = await all(ipfs.files.ls(filePath))

      expect(contents).to.be.an('array').and.have.lengthOf(1)
      expect(contents[0].name).to.equal(fileName)
    })
  })
}
