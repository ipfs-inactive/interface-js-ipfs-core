/* eslint-env mocha, browser */
'use strict'

const { fixtures } = require('./utils')
const Readable = require('readable-stream').Readable
const pull = require('pull-stream')
const mh = require('multihashes')
const CID = require('cids')
const expectTimeout = require('../utils/expect-timeout')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { supportsFileReader } = require('ipfs-utils/src/supports')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.add', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = (await common.spawn()).api })

    after(() => common.clean())

    it('should add a File', async function () {
      if (!supportsFileReader) return this.skip('skip in node')

      const filesAdded = await ipfs.add(new self.File(['should add a File'], 'filename.txt', { type: 'text/plain' }))
      expect(filesAdded[0].hash).to.be.eq('QmTVfLxf3qXiJgr4KwG6UBckcNvTqBp93Rwy5f7h3mHsVC')
    })

    it('should add a File as tuple', async function () {
      if (!supportsFileReader) return this.skip('skip in node')

      const tuple = {
        path: 'filename.txt',
        content: new self.File(['should add a File'], 'filename.txt', { type: 'text/plain' })
      }

      const filesAdded = await ipfs.add(tuple)
      expect(filesAdded[0].hash).to.be.eq('QmTVfLxf3qXiJgr4KwG6UBckcNvTqBp93Rwy5f7h3mHsVC')
    })

    it('should add a File as array of tuple', async function () {
      if (!supportsFileReader) return this.skip('skip in node')

      const tuple = {
        path: 'filename.txt',
        content: new self.File(['should add a File'], 'filename.txt', { type: 'text/plain' })
      }

      const filesAdded = await ipfs.add([tuple])
      expect(filesAdded[0].hash).to.be.eq('QmTVfLxf3qXiJgr4KwG6UBckcNvTqBp93Rwy5f7h3mHsVC')
    })

    it('should add a Buffer', async () => {
      const filesAdded = await ipfs.add(fixtures.smallFile.data)
      expect(filesAdded).to.have.length(1)

      const file = filesAdded[0]
      expect(file.hash).to.equal(fixtures.smallFile.cid)
      expect(file.path).to.equal(fixtures.smallFile.cid)
      // file.size counts the overhead by IPLD nodes and unixfs protobuf
      expect(file.size).greaterThan(fixtures.smallFile.data.length)
    })

    it('should add a BIG Buffer', async () => {
      const filesAdded = await ipfs.add(fixtures.bigFile.data)
      expect(filesAdded).to.have.length(1)

      const file = filesAdded[0]
      expect(file.hash).to.equal(fixtures.bigFile.cid)
      expect(file.path).to.equal(fixtures.bigFile.cid)
      // file.size counts the overhead by IPLD nodes and unixfs protobuf
      expect(file.size).greaterThan(fixtures.bigFile.data.length)
    })

    it('should add a BIG Buffer with progress enabled', async () => {
      let progCalled = false
      let accumProgress = 0
      function handler (p) {
        progCalled = true
        accumProgress = p
      }

      const filesAdded = await ipfs.add(fixtures.bigFile.data, { progress: handler })
      expect(filesAdded).to.have.length(1)

      const file = filesAdded[0]
      expect(file.hash).to.equal(fixtures.bigFile.cid)
      expect(file.path).to.equal(fixtures.bigFile.cid)
      expect(progCalled).to.be.true()
      expect(accumProgress).to.equal(fixtures.bigFile.data.length)
    })

    it('should add a Buffer as tuple', async () => {
      const tuple = { path: 'testfile.txt', content: fixtures.smallFile.data }

      const filesAdded = await ipfs.add([tuple])
      expect(filesAdded).to.have.length(1)

      const file = filesAdded[0]
      expect(file.hash).to.equal(fixtures.smallFile.cid)
      expect(file.path).to.equal('testfile.txt')
    })

    it('should add a string', async () => {
      const data = 'a string'
      const expectedCid = 'QmQFRCwEpwQZ5aQMqCsCaFbdjNLLHoyZYDjr92v1F7HeqX'

      const filesAdded = await ipfs.add(data)
      expect(filesAdded).to.be.length(1)

      const { path, size, hash } = filesAdded[0]
      expect(path).to.equal(expectedCid)
      expect(size).to.equal(16)
      expect(hash).to.equal(expectedCid)
    })

    it('should add a TypedArray', async () => {
      const data = Uint8Array.from([1, 3, 8])
      const expectedCid = 'QmRyUEkVCuHC8eKNNJS9BDM9jqorUvnQJK1DM81hfngFqd'

      const filesAdded = await ipfs.add(data)
      expect(filesAdded).to.be.length(1)

      const { path, size, hash } = filesAdded[0]
      expect(path).to.equal(expectedCid)
      expect(size).to.equal(11)
      expect(hash).to.equal(expectedCid)
    })

    it('should add readable stream', async () => {
      const expectedCid = 'QmVv4Wz46JaZJeH5PMV4LGbRiiMKEmszPYY3g6fjGnVXBS'

      const rs = new Readable()
      rs.push(Buffer.from('some data'))
      rs.push(null)

      const filesAdded = await ipfs.add(rs)
      expect(filesAdded).to.be.length(1)

      const file = filesAdded[0]
      expect(file.path).to.equal(expectedCid)
      expect(file.size).to.equal(17)
      expect(file.hash).to.equal(expectedCid)
    })

    it('should add array of objects with readable stream content', async () => {
      const expectedCid = 'QmVv4Wz46JaZJeH5PMV4LGbRiiMKEmszPYY3g6fjGnVXBS'

      const rs = new Readable()
      rs.push(Buffer.from('some data'))
      rs.push(null)

      const tuple = { path: 'data.txt', content: rs }

      const filesAdded = await ipfs.add([tuple])
      expect(filesAdded).to.be.length(1)

      const file = filesAdded[0]
      expect(file.path).to.equal('data.txt')
      expect(file.size).to.equal(17)
      expect(file.hash).to.equal(expectedCid)
    })

    it('should add pull stream', async () => {
      const expectedCid = 'QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE3uhm'

      const res = await ipfs.add(pull.values([Buffer.from('test')]))
      expect(res).to.have.length(1)
      expect(res[0]).to.deep.equal({ path: expectedCid, hash: expectedCid, size: 12 })
    })

    it('should add array of objects with pull stream content', async () => {
      const expectedCid = 'QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE3uhm'

      const res = await ipfs.add([{ content: pull.values([Buffer.from('test')]) }])
      expect(res).to.have.length(1)
      expect(res[0]).to.deep.equal({ path: expectedCid, hash: expectedCid, size: 12 })
    })

    it('should add a nested directory as array of tupples', async function () {
      const content = (name) => ({
        path: `test-folder/${name}`,
        content: fixtures.directory.files[name]
      })

      const emptyDir = (name) => ({ path: `test-folder/${name}` })

      const dirs = [
        content('pp.txt'),
        content('holmes.txt'),
        content('jungle.txt'),
        content('alice.txt'),
        emptyDir('empty-folder'),
        content('files/hello.txt'),
        content('files/ipfs.txt'),
        emptyDir('files/empty')
      ]

      const res = await ipfs.add(dirs)

      const root = res[res.length - 1]
      expect(root.path).to.equal('test-folder')
      expect(root.hash).to.equal(fixtures.directory.cid)
    })

    it('should add a nested directory as array of tupples with progress', async function () {
      const content = (name) => ({
        path: `test-folder/${name}`,
        content: fixtures.directory.files[name]
      })

      const emptyDir = (name) => ({ path: `test-folder/${name}` })

      const dirs = [
        content('pp.txt'),
        content('holmes.txt'),
        content('jungle.txt'),
        content('alice.txt'),
        emptyDir('empty-folder'),
        content('files/hello.txt'),
        content('files/ipfs.txt'),
        emptyDir('files/empty')
      ]

      const total = dirs.reduce((i, entry) => {
        return i + (entry.content ? entry.content.length : 0)
      }, 0)

      let progCalled = false
      let accumProgress = 0
      const handler = (p) => {
        progCalled = true
        accumProgress += p
      }

      const filesAdded = await ipfs.add(dirs, { progress: handler })

      const root = filesAdded[filesAdded.length - 1]
      expect(progCalled).to.be.true()
      expect(accumProgress).to.be.at.least(total)
      expect(root.path).to.equal('test-folder')
      expect(root.hash).to.equal(fixtures.directory.cid)
    })

    it('should add files to a directory non sequentially', async function () {
      const content = path => ({
        path: `test-dir/${path}`,
        content: fixtures.directory.files[path.split('/').pop()]
      })

      const input = [
        content('a/pp.txt'),
        content('a/holmes.txt'),
        content('b/jungle.txt'),
        content('a/alice.txt')
      ]

      const filesAdded = await ipfs.add(input)

      const toPath = ({ path }) => path
      const nonSeqDirFilePaths = input.map(toPath).filter(p => p.includes('/a/'))
      const filesAddedPaths = filesAdded.map(toPath)

      expect(nonSeqDirFilePaths.every(p => filesAddedPaths.includes(p))).to.be.true()
    })

    it('should fail when passed invalid input', () => {
      const nonValid = 138

      return expect(ipfs.add(nonValid)).to.eventually.be.rejected()
    })

    it('should wrap content in a directory', async () => {
      const data = { path: 'testfile.txt', content: fixtures.smallFile.data }

      const filesAdded = await ipfs.add(data, { wrapWithDirectory: true })
      expect(filesAdded).to.have.length(2)

      const file = filesAdded[0]
      const wrapped = filesAdded[1]
      expect(file.hash).to.equal(fixtures.smallFile.cid)
      expect(file.path).to.equal('testfile.txt')
      expect(wrapped.path).to.equal('')
    })

    it('should add with only-hash=true', async function () {
      this.slow(10 * 1000)
      const content = String(Math.random() + Date.now())

      const files = await ipfs.add(Buffer.from(content), { onlyHash: true })
      expect(files).to.have.length(1)

      await expectTimeout(ipfs.object.get(files[0].hash), 4000)
    })

    it('should add empty path and buffer content', async () => {
      const expectedHash = 'QmWfVY9y3xjsixTgbd9AorQxH7VtMpzfx2HaWtsoUYecaX'
      const content = Buffer.from('hello')

      const res = await ipfs.add([{ path: '', content }])

      expect(res).to.have.length(1)
      expect(res[0].hash).to.equal(expectedHash)
    })

    it('should add with cid-version=1', async () => {
      const expectedCid = 'bafkreiaoumr4mhytmxmaav7qbe2vpsmsxkdvyelbws5orak5u6bjrekuz4'
      const options = { cidVersion: 1 }

      const res = await ipfs.add('should add with cid-version=1', options)

      expect(res).to.have.length(1)
      expect(res[0].hash).to.equal(expectedCid)
    })

    it('should add with cid-version=1 and raw-leaves=false', async () => {
      const expectedCid = 'bafybeifj7nuqlszk47q4jvdvaurqlb7ihbqfjxofg4hfcy53oc2s5tlg5m'
      const options = { cidVersion: 1, rawLeaves: false }

      const res = await ipfs.add('.add with cid-version=1 and raw-leaves=false', options)

      expect(res).to.have.length(1)
      expect(res[0].hash).to.equal(expectedCid)
    })

    it('should pin by default', async () => {
      const initialPins = await ipfs.pin.ls()

      await ipfs.add('should add pins by default')

      const pinsAfterAdd = await ipfs.pin.ls()

      expect(pinsAfterAdd.length).to.eql(initialPins.length + 1)
    })

    it('should not pin with pin=false', async () => {
      const initialPins = await ipfs.pin.ls()

      await ipfs.add('should not pin with pin=false', { pin: false })

      const pinsAfterAdd = await ipfs.pin.ls()

      expect(pinsAfterAdd.length).to.eql(initialPins.length)
    })

    // TODO: Test against all algorithms Object.keys(mh.names)
    // This subset is known to work with both go-ipfs and js-ipfs as of 2017-09-05
    const HASH_ALGS = [
      'sha1',
      'sha2-256',
      'sha2-512',
      // 'keccak-224', // go throws
      'keccak-256',
      // 'keccak-384', // go throws
      'keccak-512'
    ]
    HASH_ALGS.forEach((name) => {
      it(`should add with hash=${name} and raw-leaves=false`, async () => {
        const file = {
          path: `${name}.txt`,
          content: `should add with hash=${name} and raw-leaves=false`
        }
        const options = { hashAlg: name, rawLeaves: false }

        const res = await ipfs.add([file], options)

        expect(res).to.have.length(1)
        const cid = new CID(res[0].hash)
        expect(mh.decode(cid.multihash).name).to.equal(name)
      })
    })
  })
}
