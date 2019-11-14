/* eslint-env mocha */
'use strict'

const { expectIsRepo } = require('../stats/utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.repo.stat', () => {
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

    it('should get repo stats', (done) => {
      ipfs.repo.stat((err, res) => {
        expectIsRepo(err, res)
        done()
      })
    })

    it('should get repo stats (promised)', () => {
      return ipfs.repo.stat().then((res) => {
        expectIsRepo(null, res)
      })
    })

    it('should get human readable repo stats', async () => {
      const res = await ipfs.repo.stat({ human: true })

      expect(res).to.exist()
      expect(res).to.have.a.property('numObjects')
      expect(res).to.have.a.property('repoSize')
      expect(res).to.have.a.property('repoPath')
      expect(res).to.have.a.property('version')
      expect(res).to.have.a.property('storageMax')
      expect(res.numObjects).to.be.a('number')
      expect(res.repoSize).to.match(/\s.?B$/gm)
      expect(res.storageMax).to.match(/\s.?B$/gm)
      expect(res.repoPath).to.be.a('string')
      expect(res.version).to.be.a('string')
    })
  })
}
