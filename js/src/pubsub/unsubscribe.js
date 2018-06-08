/* eslint-env mocha */
/* eslint max-nested-callbacks: ['error', 8] */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const each = require('async/each')
const times = require('async/times')
const { getTopic } = require('./utils')
const { getDescribe, getIt } = require('../utils/mocha')

const expect = chai.expect
chai.use(dirtyChai)

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.pubsub.unsubscribe', function () {
    this.timeout(80 * 1000)

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

    it('should subscribe and unsubscribe 10 times', (done) => {
      const count = 10
      const someTopic = getTopic()

      times(count, (_, cb) => {
        const handler = (msg) => {}
        ipfs.pubsub.subscribe(someTopic, handler, (err) => cb(err, handler))
      }, (err, handlers) => {
        expect(err).to.not.exist()
        each(
          handlers,
          (handler, cb) => ipfs.pubsub.unsubscribe(someTopic, handler, cb),
          (err) => {
            expect(err).to.not.exist()
            // Assert unsubscribe worked
            ipfs.pubsub.ls((err, topics) => {
              expect(err).to.not.exist()
              expect(topics).to.eql([])
              done()
            })
          }
        )
      })
    })
  })
}
