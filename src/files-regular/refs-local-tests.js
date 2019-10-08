/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, suiteName, ipfsRefsLocal, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe(suiteName, function () {
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

    after((done) => common.teardown(done))

    it('should get local refs', function (done) {
      const content = (name) => ({
        path: `test-folder/${name}`,
        content: fixtures.directory.files[name]
      })

      const dirs = [
        content('pp.txt'),
        content('holmes.txt')
      ]

      ipfs.add(dirs, (err, res) => {
        expect(err).to.not.exist()

        ipfsRefsLocal(ipfs)((err, refs) => {
          expect(err).to.not.exist()

          const cids = refs.map(r => r.ref)
          expect(cids).to.include('bafkreicuinkdxczmxol5edpb2jumkbkvtoehj6qixz6yvvxgstp3cr5hey')
          expect(cids).to.include('bafkreigm5vpfwjayhkmp7d3gc6hwj4c536ns6ajxi3cyi3uulta45rpyzy')

          done()
        })
      })
    })
  })
}
