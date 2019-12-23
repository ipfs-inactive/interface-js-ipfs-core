/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { fixtures } = require('../files-regular/utils')
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

      return expect(ipfs.files.ls(`${testDir}/404`)).to.eventually.be.rejected()
    })

    it('should ls directory', async () => {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(`${testDir}/lv1`, { parents: true })
      await ipfs.files.write(`${testDir}/b`, Buffer.from('Hello, world!'), { create: true })

      const entries = await ipfs.files.ls(testDir)

      expect(entries).to.have.lengthOf(2)
      expect(entries).to.have.nested.property('[0].name', 'b')
      expect(entries).to.have.nested.property('[0].type', 0)
      expect(entries).to.have.nested.property('[0].size', 0)
      expect(entries).to.have.nested.property('[0].hash', '')
      expect(entries).to.have.nested.property('[1].name', 'lv1')
      expect(entries).to.have.nested.property('[1].type', 0)
      expect(entries).to.have.nested.property('[1].size', 0)
      expect(entries).to.have.nested.property('[1].hash', '')
    })

    it('should ls directory with long option', async () => {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(`${testDir}/lv1`, { parents: true })
      await ipfs.files.write(`${testDir}/b`, Buffer.from('Hello, world!'), { create: true })

      const entries = await ipfs.files.ls(testDir, { long: true })

      expect(entries).to.have.lengthOf(2)
      expect(entries).to.have.nested.property('[0].name', 'b')
      expect(entries).to.have.nested.property('[0].type', 0)
      expect(entries).to.have.nested.property('[0].size', 13)
      expect(entries).to.have.nested.property('[0].hash', 'QmcZojhwragQr5qhTeFAmELik623Z21e3jBTpJXoQ9si1T')
      expect(entries).to.have.nested.property('[1].name', 'lv1')
      expect(entries).to.have.nested.property('[1].type', 1)
      expect(entries).to.have.nested.property('[1].size', 0)
      expect(entries).to.have.nested.property('[1].hash', 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn')
    })

    it('ls directory with long option should include metadata', async () => {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(`${testDir}/lv1`, { parents: true })
      await ipfs.files.write(`${testDir}/b`, Buffer.from('Hello, world!'), { create: true })

      const entries = await ipfs.files.ls(testDir, { long: true })

      expect(entries).to.have.lengthOf(2)
      expect(entries).to.have.nested.property('[0].hash', 'QmcZojhwragQr5qhTeFAmELik623Z21e3jBTpJXoQ9si1T')
      expect(entries).to.have.nested.property('[0].mode', parseInt('0644', 8))
      expect(entries).to.have.nested.deep.property('[0].mtime')
      expect(entries).to.have.nested.property('[1].hash', 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn')
      expect(entries).to.have.nested.property('[1].mode', parseInt('0755', 8))
      expect(entries).to.have.nested.deep.property('[1].mtime')
    })

    it('should ls from outside of mfs', async () => {
      const testFileName = hat()
      const [{
        hash
      }] = await ipfs.add({ path: `/test/${testFileName}`, content: fixtures.smallFile.data })
      const listing = await ipfs.files.ls('/ipfs/' + hash)
      expect(listing).to.have.length(1)
      expect(listing[0].name).to.equal(hash)
    })

    it('should list an empty directory', async () => {
      const testDir = `/test-${hat()}`
      await ipfs.files.mkdir(testDir)
      const contents = await ipfs.files.ls(testDir)

      expect(contents).to.be.an('array').and.to.be.empty()
    })

    it('should list a file directly', async () => {
      const fileName = `single-file-${hat()}.txt`
      const filePath = `/${fileName}`
      await ipfs.files.write(filePath, Buffer.from('Hello world'), {
        create: true
      })
      const entries = await ipfs.files.ls(filePath)

      expect(entries).to.have.lengthOf(1)
      expect(entries).to.have.nested.property('[0].name', fileName)
      expect(entries).to.have.nested.property('[0].type', 0)
      expect(entries).to.have.nested.property('[0].size', 0)
      expect(entries).to.have.nested.property('[0].hash', '')
    })
  })
}
