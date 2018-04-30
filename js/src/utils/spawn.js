const waterfall = require('async/waterfall')

function spawnWithId (factory, callback) {
  waterfall([
    (cb) => factory.spawnNode(cb),
    (node, cb) => node.id((err, peerId) => {
      if (err) {
        return cb(err)
      }
      node.peerId = peerId
      cb(null, node)
    })
  ], callback)
}

exports.spawnWithId = spawnWithId
