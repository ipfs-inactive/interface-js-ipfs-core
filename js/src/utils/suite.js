function createSuite (tests, parent) {
  const suite = (createCommon, options) => {
    Object.keys(tests).forEach(t => {
      const opts = Object.assign({}, options)
      const suiteName = parent ? `${parent}.${t}` : t

      if (Array.isArray(opts.skip)) {
        if (opts.skip.includes(suiteName)) {
          opts.skip = true
        }
      }

      if (Array.isArray(opts.only)) {
        if (opts.only.includes(suiteName)) {
          opts.only = true
        }
      }

      tests[t](createCommon, opts)
    })
  }

  return Object.assign(suite, tests)
}

module.exports.createSuite = createSuite
