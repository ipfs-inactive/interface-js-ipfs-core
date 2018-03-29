/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */

'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const timesSeries = require('async/timesSeries')
const auto = require('async/auto')
const loadFixture = require('aegir/fixtures')
const { spawnWithId } = require('./utils/spawn')

const testFiles = [
  loadFixture('js/test/fixtures/testfile.txt', 'interface-ipfs-core'),
  loadFixture('js/test/fixtures/test-folder/alice.txt', 'interface-ipfs-core')
]

module.exports = (common) => {
  describe.only('.name', function () {
    this.timeout(50 * 1000)

    let nodes
    let files

    beforeEach(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      auto({
        factory: cb => common.setup(cb),
        // Create two nodes
        nodes: ['factory', (res, cb) => {
          timesSeries(2, (i, cb) => spawnWithId(res.factory, cb), cb)
        }],
        // Connect up the two nodes
        connect0: ['nodes', (res, cb) => {
          res.nodes[0].swarm.connect(res.nodes[1].peerId.addresses[0], cb)
        }],
        connect1: ['nodes', (res, cb) => {
          res.nodes[1].swarm.connect(res.nodes[0].peerId.addresses[0], cb)
        }],
        // Add files to node 0
        files: ['nodes', (res, cb) => res.nodes[0].files.add(testFiles, cb)]
      }, (err, res) => {
        if (err) return done(err)
        nodes = res.nodes
        files = res.files
        done()
      })
    })

    afterEach((done) => common.teardown(done))

    describe('callback API', () => {
      it('should publish and resolve', function (done) {
        // Publish takes ages on go-ipfs
        // https://github.com/ipfs/go-ipfs/issues/4475
        this.timeout(5 * 60 * 1000)

        auto({
          publish: cb => {
            nodes[0].name.publish(files[0].hash, (err, res) => {
              expect(err).to.not.exist()
              expect(res).to.deep.equal({
                name: nodes[0].peerId.id,
                value: `/ipfs/${files[0].hash}`
              })
              cb()
            })
          },
          resolve0: ['publish', (_, cb) => {
            nodes[0].name.resolve(`/ipns/${nodes[0].peerId.id}`, (err, res) => {
              expect(err).to.not.exist()
              expect(res).to.equal(`/ipfs/${files[0].hash}`)
              cb()
            })
          }],
          resolve1: ['publish', (_, cb) => {
            nodes[1].name.resolve(`/ipns/${nodes[0].peerId.id}`, (err, res) => {
              expect(err).to.not.exist()
              expect(res).to.equal(`/ipfs/${files[0].hash}`)
              cb()
            })
          }]
        }, done)
      })
    })
  })
}
