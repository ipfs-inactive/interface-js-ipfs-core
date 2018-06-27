/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const loadFixture = require('aegir/fixtures')
const expect = chai.expect
chai.use(dirtyChai)

module.exports = (common) => {
  describe('.files (MFS Specific)', function () {
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

    describe('.mkdir', function () {
      it('make directory on root', function (done) {
        ipfs.files.mkdir('/test', (err) => {
          expect(err).to.not.exist()
          done()
        })
      })

      it('make directory and its parents', function (done) {
        ipfs.files.mkdir('/test/lv1/lv2', { p: true }, (err) => {
          expect(err).to.not.exist()
          done()
        })
      })

      it('make already existent directory', function (done) {
        ipfs.files.mkdir('/', (err) => {
          expect(err).to.exist()
          done()
        })
      })
    })

    describe('.write', function () {
      it('expect error', function (done) {
        ipfs.files.write('/test/a', Buffer.from('Hello, world!'), (err) => {
          expect(err).to.exist()
          done()
        })
      })

      it('expect no error', function (done) {
        ipfs.files.write('/test/a', Buffer.from('Hello, world!'), {create: true}, (err) => {
          expect(err).to.not.exist()
          done()
        })
      })
    })

    describe('.cp', function () {
      it('copy file, expect error', function (done) {
        ipfs.files.cp(['/test/c', '/test/b'], (err) => {
          expect(err).to.exist()
          done()
        })
      })

      it('copy file, expect no error', function (done) {
        ipfs.files.cp(['/test/a', '/test/b'], (err) => {
          expect(err).to.not.exist()
          done()
        })
      })

      it('copy dir, expect error', function (done) {
        ipfs.files.cp(['/test/lv1/lv3', '/test/lv1/lv4'], (err) => {
          expect(err).to.exist()
          done()
        })
      })

      it('copy dir, expect no error', function (done) {
        ipfs.files.cp(['/test/lv1/lv2', '/test/lv1/lv3'], (err) => {
          expect(err).to.not.exist()
          done()
        })
      })

      it('copy file from outside mfs, expect no error', function (done) {
        ipfs.files.cp(['/ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn', '/external-dir'], (err) => {
          expect(err).to.not.exist()
          done()
        })
      })
    })

    describe('.mv', function () {
      it('move file, expect error', function (done) {
        ipfs.files.mv(['/test/404', '/test/a'], (err) => {
          expect(err).to.exist()
          done()
        })
      })

      it('move file, expect no error', function (done) {
        ipfs.files.mv(['/test/a', '/test/c'], (err) => {
          expect(err).to.not.exist()
          done()
        })
      })

      it('move dir, expect error', function (done) {
        ipfs.files.mv(['/test/lv1/404', '/test/lv1'], (err) => {
          expect(err).to.exist()
          done()
        })
      })

      it('move dir, expect no error', function (done) {
        ipfs.files.mv(['/test/lv1/lv2', '/test/lv1/lv4'], (err) => {
          expect(err).to.not.exist()
          done()
        })
      })
    })

    describe('.rm', function () {
      it('remove file, expect error', function (done) {
        ipfs.files.rm('/test/a', (err) => {
          expect(err).to.exist()
          done()
        })
      })

      it('remove file, expect no error', function (done) {
        ipfs.files.rm('/test/c', (err) => {
          expect(err).to.not.exist()
          done()
        })
      })

      it('remove dir, expect error', function (done) {
        ipfs.files.rm('/test/lv1/lv4', (err) => {
          expect(err).to.exist()
          done()
        })
      })

      it('remove dir, expect no error', function (done) {
        ipfs.files.rm('/test/lv1/lv4', {recursive: true}, (err) => {
          expect(err).to.not.exist()
          done()
        })
      })
    })

    describe('.stat', function () {
      it('stat not found, expect error', function (done) {
        ipfs.files.stat('/test/404', (err) => {
          expect(err).to.exist()
          done()
        })
      })

      it('stat file', function (done) {
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

      it('stat dir', function (done) {
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
      it.skip('stat withLocal file', function (done) {
        ipfs.files.stat('/test/b', {'withLocal': true}, (err, stat) => {
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
      it.skip('stat withLocal dir', function (done) {
        ipfs.files.stat('/test', {'withLocal': true}, (err, stat) => {
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
    })

    describe('.read', function () {
      it('read not found, expect error', function (done) {
        ipfs.files.read('/test/404', (err, buf) => {
          expect(err).to.exist()
          expect(buf).to.not.exist()
          done()
        })
      })

      it('read file', function (done) {
        ipfs.files.read('/test/b', (err, buf) => {
          expect(err).to.not.exist()
          expect(buf).to.eql(Buffer.from('Hello, world!'))
          done()
        })
      })
    })

    describe('.ls', function () {
      it('ls not found, expect error', function (done) {
        ipfs.files.ls('/test/404', (err, info) => {
          expect(err).to.exist()
          expect(info).to.not.exist()
          done()
        })
      })

      // https://github.com/ipfs/go-ipfs/issues/5026
      it.skip('ls directory', function (done) {
        ipfs.files.ls('/test', (err, info) => {
          expect(err).to.not.exist()
          expect(info).to.eql([
            { name: 'b', type: 0, size: 0, hash: '' },
            { name: 'lv1', type: 0, size: 0, hash: '' }
          ])
          done()
        })
      })

      // https://github.com/ipfs/go-ipfs/issues/5026
      it.skip('ls -l directory', function (done) {
        ipfs.files.ls('/test', { l: true }, (err, info) => {
          expect(err).to.not.exist()
          expect(info).to.eql([
            {
              name: 'b',
              type: 'file',
              size: 13,
              hash: 'QmcZojhwragQr5qhTeFAmELik623Z21e3jBTpJXoQ9si1T'
            },
            {
              name: 'lv1',
              type: 'directory',
              size: 0,
              hash: 'QmaSPtNHYKPjNjQnYX9pdu5ocpKUQEL3itSz8LuZcoW6J5'
            }
          ])
          done()
        })
      })
    })

    describe('.flush', function () {
      it('flush not found, expect error', function (done) {
        ipfs.files.flush('/test/404', (err) => {
          expect(err).to.exist()
          done()
        })
      })

      it('flush root', function (done) {
        ipfs.files.flush((err) => {
          expect(err).to.not.exist()
          done()
        })
      })

      it('flush specific dir', function (done) {
        ipfs.files.flush('/test', (err) => {
          expect(err).to.not.exist()
          done()
        })
      })
    })

    describe('.stat', () => {
      const smallFile = {
        cid: 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP',
        data: loadFixture('js/test/fixtures/testfile.txt', 'interface-ipfs-core')
      }

      before((done) => ipfs.files.add(smallFile.data, done))

      it('stat outside of mfs', function (done) {
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
  })
}
