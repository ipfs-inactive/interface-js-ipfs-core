/* eslint-env mocha */
'use strict'

const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.block.get', () => {
    const data = Buffer.from(`blorb${Date.now()}`)
    let ipfs, cid

    before(async function () {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      const factory = await common.setup()
      ipfs = await factory.spawnNode()

      const block = await ipfs.block.put(data).first()
      cid = block.cid
    })

    after(() => common.teardown())

    it('should get by CID instance', async () => {
      const blockData = await ipfs.block.get(cid)
      expect(blockData).to.eql(data)
    })

    it('should get by CID string', async () => {
      const blockData = await ipfs.block.get(cid.toString())
      expect(blockData).to.eql(data)
    })

    it('should get by CID buffer', async () => {
      const blockData = await ipfs.block.get(cid.buffer)
      expect(blockData).to.eql(data)
    })

    it('should get an empty block', async () => {
      const cid = await ipfs.block.put(Buffer.alloc(0), {
        format: 'dag-pb',
        hashAlg: 'sha2-256',
        cidVersion: 0
      }).first()

      const data = await ipfs.block.get(cid)
      expect(data).to.eql(Buffer.alloc(0))
    })
  })
}
