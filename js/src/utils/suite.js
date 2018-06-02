function createSuite (tests) {
  const suite = (common, options) => {
    Object.keys(tests).forEach(t => {
      const opts = Object.assign({}, options)
      opts.skip = Array.isArray(opts.skip) ? opts.skip.includes(t) : opts.skip
      opts.only = Array.isArray(opts.only) ? opts.only.includes(t) : opts.only
      tests[t](common, opts)
    })
  }

  return Object.assign(suite, tests)
}

module.exports.createSuite = createSuite
