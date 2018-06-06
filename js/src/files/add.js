/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const loadFixture = require('aegir/fixtures')
const Readable = require('readable-stream').Readable
const pull = require('pull-stream')
const path = require('path')
const isNode = require('detect-node')
const expectTimeout = require('../utils/expect-timeout')
const { getDescribe, getIt } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.files.add', function () {
    this.timeout(40 * 1000)

    let ipfs

    const smallFile = {
      cid: 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP',
      data: loadFixture('js/test/fixtures/testfile.txt', 'interface-ipfs-core')
    }

    const bigFile = {
      cid: 'Qme79tX2bViL26vNjPsF3DP1R9rMKMvnPYJiKTTKPrXJjq',
      data: loadFixture('js/test/fixtures/15mb.random', 'interface-ipfs-core')
    }

    const directory = {
      cid: 'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP',
      files: {
        'pp.txt': loadFixture('js/test/fixtures/test-folder/pp.txt', 'interface-ipfs-core'),
        'holmes.txt': loadFixture('js/test/fixtures/test-folder/holmes.txt', 'interface-ipfs-core'),
        'jungle.txt': loadFixture('js/test/fixtures/test-folder/jungle.txt', 'interface-ipfs-core'),
        'alice.txt': loadFixture('js/test/fixtures/test-folder/alice.txt', 'interface-ipfs-core'),
        'files/hello.txt': loadFixture('js/test/fixtures/test-folder/files/hello.txt', 'interface-ipfs-core'),
        'files/ipfs.txt': loadFixture('js/test/fixtures/test-folder/files/ipfs.txt', 'interface-ipfs-core')
      }
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

    after((done) => common.teardown(done))

    it('should add a Buffer', (done) => {
      ipfs.files.add(smallFile.data, (err, filesAdded) => {
        expect(err).to.not.exist()

        expect(filesAdded).to.have.length(1)
        const file = filesAdded[0]
        expect(file.hash).to.equal(smallFile.cid)
        expect(file.path).to.equal(smallFile.cid)
        // file.size counts the overhead by IPLD nodes and unixfs protobuf
        expect(file.size).greaterThan(smallFile.data.length)
        done()
      })
    })

    it('should add a Buffer (promised)', () => {
      return ipfs.files.add(smallFile.data)
        .then((filesAdded) => {
          const file = filesAdded[0]
          expect(file.hash).to.equal(smallFile.cid)
          expect(file.path).to.equal(smallFile.cid)
        })
    })

    it('should add a BIG Buffer', (done) => {
      ipfs.files.add(bigFile.data, (err, filesAdded) => {
        expect(err).to.not.exist()

        expect(filesAdded).to.have.length(1)
        const file = filesAdded[0]
        expect(file.hash).to.equal(bigFile.cid)
        expect(file.path).to.equal(bigFile.cid)
        // file.size counts the overhead by IPLD nodes and unixfs protobuf
        expect(file.size).greaterThan(bigFile.data.length)
        done()
      })
    })

    it('should add a BIG Buffer with progress enabled', (done) => {
      let progCalled = false
      let accumProgress = 0
      function handler (p) {
        progCalled = true
        accumProgress = p
      }

      ipfs.files.add(bigFile.data, { progress: handler }, (err, filesAdded) => {
        expect(err).to.not.exist()

        expect(filesAdded).to.have.length(1)
        const file = filesAdded[0]
        expect(file.hash).to.equal(bigFile.cid)
        expect(file.path).to.equal(bigFile.cid)

        expect(progCalled).to.be.true()
        expect(accumProgress).to.equal(bigFile.data.length)
        done()
      })
    })

    it('should add a Buffer as tuple', (done) => {
      const tuple = { path: 'testfile.txt', content: smallFile.data }

      ipfs.files.add([
        tuple
      ], (err, filesAdded) => {
        expect(err).to.not.exist()

        expect(filesAdded).to.have.length(1)
        const file = filesAdded[0]
        expect(file.hash).to.equal(smallFile.cid)
        expect(file.path).to.equal('testfile.txt')

        done()
      })
    })

    it('should not be able to add by path', (done) => {
      const validPath = path.join(process.cwd() + '/package.json')

      ipfs.files.add(validPath, (err, res) => {
        expect(err).to.exist()
        done()
      })
    })

    it('should add readable stream', (done) => {
      const expectedCid = 'QmVv4Wz46JaZJeH5PMV4LGbRiiMKEmszPYY3g6fjGnVXBS'

      const rs = new Readable()
      rs.push(Buffer.from('some data'))
      rs.push(null)

      ipfs.files.add(rs, (err, filesAdded) => {
        expect(err).to.not.exist()

        expect(filesAdded).to.be.length(1)
        const file = filesAdded[0]
        expect(file.path).to.equal(expectedCid)
        expect(file.size).to.equal(17)
        expect(file.hash).to.equal(expectedCid)
        done()
      })
    })

    it('should add array of objects with readable stream content', (done) => {
      const expectedCid = 'QmVv4Wz46JaZJeH5PMV4LGbRiiMKEmszPYY3g6fjGnVXBS'

      const rs = new Readable()
      rs.push(Buffer.from('some data'))
      rs.push(null)

      const tuple = { path: 'data.txt', content: rs }

      ipfs.files.add([tuple], (err, filesAdded) => {
        expect(err).to.not.exist()

        expect(filesAdded).to.be.length(1)
        const file = filesAdded[0]
        expect(file.path).to.equal('data.txt')
        expect(file.size).to.equal(17)
        expect(file.hash).to.equal(expectedCid)
        done()
      })
    })

    it('should add pull stream', (done) => {
      const expectedCid = 'QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE3uhm'

      ipfs.files.add(pull.values([Buffer.from('test')]), (err, res) => {
        if (err) return done(err)
        expect(res).to.have.length(1)
        expect(res[0]).to.deep.equal({ path: expectedCid, hash: expectedCid, size: 12 })
        done()
      })
    })

    it('should add pull stream (promised)', () => {
      const expectedCid = 'QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE3uhm'

      return ipfs.files.add(pull.values([Buffer.from('test')]))
        .then((res) => {
          expect(res).to.have.length(1)
          expect(res[0]).to.deep.equal({ path: expectedCid, hash: expectedCid, size: 12 })
        })
    })

    it('should add array of objects with pull stream content (promised)', () => {
      const expectedCid = 'QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE3uhm'

      return ipfs.files.add([{ content: pull.values([Buffer.from('test')]) }])
        .then((res) => {
          expect(res).to.have.length(1)
          expect(res[0]).to.deep.equal({ path: expectedCid, hash: expectedCid, size: 12 })
        })
    })

    it('should add a nested directory as array of tupples', function (done) {
      // TODO: https://github.com/ipfs/js-ipfs-api/issues/339
      if (!isNode) { this.skip() }

      const content = (name) => ({
        path: `test-folder/${name}`,
        content: directory.files[name]
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

      ipfs.files.add(dirs, (err, res) => {
        expect(err).to.not.exist()
        const root = res[res.length - 1]

        expect(root.path).to.equal('test-folder')
        expect(root.hash).to.equal(directory.cid)
        done()
      })
    })

    it('should add a nested directory as array of tuppled with progress', function (done) {
      // TODO: https://github.com/ipfs/js-ipfs-api/issues/339
      if (!isNode) { this.skip() }

      const content = (name) => ({
        path: `test-folder/${name}`,
        content: directory.files[name]
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

      ipfs.files.add(dirs, { progress: handler }, (err, filesAdded) => {
        expect(err).to.not.exist()
        const root = filesAdded[filesAdded.length - 1]

        expect(progCalled).to.be.true()
        expect(accumProgress).to.be.at.least(total)
        expect(root.path).to.equal('test-folder')
        expect(root.hash).to.equal(directory.cid)
        done()
      })
    })

    it('should fail when passed invalid input', (done) => {
      const nonValid = 'sfdasfasfs'

      ipfs.files.add(nonValid, (err, result) => {
        expect(err).to.exist()
        done()
      })
    })

    it('should wrap content in a directory', (done) => {
      const data = { path: 'testfile.txt', content: smallFile.data }

      ipfs.files.add(data, { wrapWithDirectory: true }, (err, filesAdded) => {
        expect(err).to.not.exist()
        expect(filesAdded).to.have.length(2)
        const file = filesAdded[0]
        const wrapped = filesAdded[1]
        expect(file.hash).to.equal(smallFile.cid)
        expect(file.path).to.equal('testfile.txt')
        expect(wrapped.path).to.equal('')
        done()
      })
    })

    it('should add with only-hash=true (promised)', function () {
      this.slow(10 * 1000)
      const content = String(Math.random() + Date.now())

      return ipfs.files.add(Buffer.from(content), { onlyHash: true })
        .then(files => {
          expect(files).to.have.length(1)

          // 'ipfs.object.get(<hash>)' should timeout because content wasn't actually added
          return expectTimeout(ipfs.object.get(files[0].hash), 4000)
        })
    })
  })
}
