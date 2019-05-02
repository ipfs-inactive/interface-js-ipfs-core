/* eslint-env mocha */
'use strict'

const map = require('async/map')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, suiteName, ipfsRefs, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe(suiteName, function () {
    this.timeout(40 * 1000)

    let ipfs, rootCid

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

    before(function (done) {
      loadContent(ipfs, getMockObjects(), (err, cid) => {
        expect(err).to.not.exist()
        rootCid = cid
        done()
      })
    })

    after((done) => common.teardown(done))

    for (const [name, options] of Object.entries(getRefsTests())) {
      const { path, params, expected, expectError, expectTimeout } = options
      // eslint-disable-next-line no-loop-func
      it(name, function (done) {
        this.timeout(20 * 1000)

        // If we're expecting a timeout, call done when it expires
        let timeout
        if (expectTimeout) {
          timeout = setTimeout(() => {
            done()
            done = null
          }, expectTimeout)
        }

        // Call out to IPFS
        const p = (path ? path(rootCid) : rootCid)
        ipfsRefs(ipfs)(p, params, (err, refs) => {
          if (!done) {
            // Already timed out
            return
          }

          if (expectError) {
            // Expected an error
            expect(err).to.exist()
            return done()
          }

          if (expectTimeout && !err) {
            // Expected a timeout but there wasn't one
            return expect.fail('Expected timeout error')
          }

          // Check there was no error and the refs match what was expected
          expect(err).to.not.exist()
          expect(refs.map(r => r.Ref)).to.eql(expected)

          // Clear any pending timeout
          clearTimeout(timeout)

          done()
        })
      })
    }
  })
}

function getMockObjects () {
  return {
    animals: {
      land: {
        'african.txt': ['elephant', 'rhinocerous'],
        'americas.txt': ['ñandu', 'tapir'],
        'australian.txt': ['emu', 'kangaroo']
      },
      sea: {
        'atlantic.txt': ['dolphin', 'whale'],
        'indian.txt': ['cuttlefish', 'octopus']
      }
    },
    fruits: {
      'tropical.txt': ['banana', 'pineapple']
    },
    'atlantic-animals': ['dolphin', 'whale'],
    'mushroom.txt': ['mushroom']
  }
}

function getRefsTests () {
  return {
    'prints added files': {
      params: {},
      expected: [
        'QmYEJ7qQNZUvBnv4SZ3rEbksagaan3sGvnUq948vSG8Z34',
        'QmUXzZKa3xhTauLektUiK4GiogHskuz1c57CnnoP4TgYJD',
        'QmYLvZrFn8KE2bcJ9UFhthScBVbbcXEgkJnnCBeKWYkpuQ',
        'QmRfqT4uTUgFXhWbfBZm6eZxi2FQ8pqYK5tcWRyTZ7RcgY'
      ]
    },

    'prints files in edges format': {
      params: { e: true },
      expected: [
        'Qmd5MhNjx3NSZm3L2QKG1TFvqkTRbtZwGJinqEfqpfHH7s -> QmYEJ7qQNZUvBnv4SZ3rEbksagaan3sGvnUq948vSG8Z34',
        'Qmd5MhNjx3NSZm3L2QKG1TFvqkTRbtZwGJinqEfqpfHH7s -> QmUXzZKa3xhTauLektUiK4GiogHskuz1c57CnnoP4TgYJD',
        'Qmd5MhNjx3NSZm3L2QKG1TFvqkTRbtZwGJinqEfqpfHH7s -> QmYLvZrFn8KE2bcJ9UFhthScBVbbcXEgkJnnCBeKWYkpuQ',
        'Qmd5MhNjx3NSZm3L2QKG1TFvqkTRbtZwGJinqEfqpfHH7s -> QmRfqT4uTUgFXhWbfBZm6eZxi2FQ8pqYK5tcWRyTZ7RcgY'
      ]
    },

    'prints files in custom format': {
      params: { format: '<linkname>: <src> => <dst>' },
      expected: [
        'animals: Qmd5MhNjx3NSZm3L2QKG1TFvqkTRbtZwGJinqEfqpfHH7s => QmYEJ7qQNZUvBnv4SZ3rEbksagaan3sGvnUq948vSG8Z34',
        'atlantic-animals: Qmd5MhNjx3NSZm3L2QKG1TFvqkTRbtZwGJinqEfqpfHH7s => QmUXzZKa3xhTauLektUiK4GiogHskuz1c57CnnoP4TgYJD',
        'fruits: Qmd5MhNjx3NSZm3L2QKG1TFvqkTRbtZwGJinqEfqpfHH7s => QmYLvZrFn8KE2bcJ9UFhthScBVbbcXEgkJnnCBeKWYkpuQ',
        'mushroom.txt: Qmd5MhNjx3NSZm3L2QKG1TFvqkTRbtZwGJinqEfqpfHH7s => QmRfqT4uTUgFXhWbfBZm6eZxi2FQ8pqYK5tcWRyTZ7RcgY'
      ]
    },

    'follows a path, <hash>/<subdir>': {
      path: (cid) => `/ipfs/${cid}/animals`,
      params: { format: '<linkname>' },
      expected: [
        'land',
        'sea'
      ]
    },

    'follows a path, <hash>/<subdir>/<subdir>': {
      path: (cid) => `/ipfs/${cid}/animals/land`,
      params: { format: '<linkname>' },
      expected: [
        'african.txt',
        'americas.txt',
        'australian.txt'
      ]
    },

    'follows a path with recursion, <hash>/<subdir>': {
      path: (cid) => `/ipfs/${cid}/animals`,
      params: { format: '<linkname>', r: true },
      expected: [
        'land',
        'african.txt',
        'americas.txt',
        'australian.txt',
        'sea',
        'atlantic.txt',
        'indian.txt'
      ]
    },

    'recursively follows folders, -r': {
      params: { format: '<linkname>', r: true },
      expected: [
        'animals',
        'land',
        'african.txt',
        'americas.txt',
        'australian.txt',
        'sea',
        'atlantic.txt',
        'indian.txt',
        'atlantic-animals',
        'fruits',
        'tropical.txt',
        'mushroom.txt'
      ]
    },

    'recursive with unique option': {
      params: { format: '<linkname>', r: true, u: true },
      expected: [
        'animals',
        'land',
        'african.txt',
        'americas.txt',
        'australian.txt',
        'sea',
        'atlantic.txt',
        'indian.txt',
        'fruits',
        'tropical.txt',
        'mushroom.txt'
      ]
    },

    'max depth of 1': {
      params: { format: '<linkname>', r: true, 'max-depth': 1 },
      expected: [
        'animals',
        'atlantic-animals',
        'fruits',
        'mushroom.txt'
      ]
    },

    'max depth of 2': {
      params: { format: '<linkname>', r: true, 'max-depth': 2 },
      expected: [
        'animals',
        'land',
        'sea',
        'atlantic-animals',
        'fruits',
        'tropical.txt',
        'mushroom.txt'
      ]
    },

    'max depth of 3': {
      params: { format: '<linkname>', r: true, 'max-depth': 3 },
      expected: [
        'animals',
        'land',
        'african.txt',
        'americas.txt',
        'australian.txt',
        'sea',
        'atlantic.txt',
        'indian.txt',
        'atlantic-animals',
        'fruits',
        'tropical.txt',
        'mushroom.txt'
      ]
    },

    'max depth of 0': {
      params: { r: true, 'max-depth': 0 },
      expected: []
    },

    'follows a path with max depth 1, <hash>/<subdir>': {
      path: (cid) => `/ipfs/${cid}/animals`,
      params: { format: '<linkname>', r: true, 'max-depth': 1 },
      expected: [
        'land',
        'sea'
      ]
    },

    'follows a path with max depth 2, <hash>/<subdir>': {
      path: (cid) => `/ipfs/${cid}/animals`,
      params: { format: '<linkname>', r: true, 'max-depth': 2 },
      expected: [
        'land',
        'african.txt',
        'americas.txt',
        'australian.txt',
        'sea',
        'atlantic.txt',
        'indian.txt'
      ]
    },

    'cannot specify edges and format': {
      params: { format: '<linkname>', e: true },
      expectError: true
    },

    'prints nothing for non-existent hashes': {
      path: () => 'QmYmW4HiZhotsoSqnv2o1oSssvkRM8b9RweBoH7ao5nki2',
      expectTimeout: 4000
    }
  }
}

function loadContent (ipfs, node, callback) {
  if (Array.isArray(node)) {
    ipfs.object.put({ Data: node.join('\n'), Links: [] }, callback)
  }

  if (typeof node === 'object') {
    const entries = Object.entries(node)
    const sorted = entries.sort((a, b) => a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0)
    map(sorted, ([name, child], cb) => {
      loadContent(ipfs, child, (err, cid) => {
        cb(err, { name, cid: cid && cid.toString() })
      })
    }, (err, res) => {
      if (err) {
        return callback(err)
      }

      ipfs.object.put({
        Data: '',
        Links: res.map(({ name, cid }) => ({ Name: name, Hash: cid, Size: 8 }))
      }, callback)
    })
  }
}
