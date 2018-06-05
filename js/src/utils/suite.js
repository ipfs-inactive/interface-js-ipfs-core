function createSuite (tests) {
  const suite = (createCommon, options) => {
    Object.keys(tests).forEach(t => {
      const opts = Object.assign({}, options)

      if (Array.isArray(opts.skip)) {
        if (opts.skip.includes(t)) {
          opts.skip = true
        }
      }

      if (Array.isArray(opts.only)) {
        if (opts.only.includes(t)) {
          opts.only = true
        }
      }

      tests[t](createCommon, opts)
    })
  }

  return Object.assign(suite, tests)
}

module.exports.createSuite = createSuite
