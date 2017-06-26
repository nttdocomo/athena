/* global define */
;(function (root, factory) {
  if (typeof define === 'function') {
    // Now we're wrapping the factory and assigning the return
    // value to the root (window) and returning it as well to
    // the AMD loader.
    if (define.amd) {
      define(['underscore'], factory)
    }
    if (define.cmd) {
      define(function (require, exports, module) {
        return factory(require('underscore'))
      })
    }
  } else if (typeof module === 'object' && module.exports) {
    // I've not encountered a need for this yet, since I haven't
    // run into a scenario where plain modules depend on CommonJS
    // *and* I happen to be loading in a CJS browser environment
    // but I'm including it for the sake of being thorough
    module.exports = (root.Class = factory(/*require('./polyfill/object/create')*/))
  } else {
    root.Class = factory()
  }
}(this, function (_) {
  var fork = function (obj) {
    var ret, key, value

    if (obj && _.isOject(obj)) {
      ret = Object.create(obj)

      for (key in obj) {
        value = obj[key]

        if (value) {
          if (_.isOject(value)) {
            ret[key] = fork(value)
          } else if (_.isArray(value)) {
            ret[key] = _.clone(value)
          }
        }
      }
    } else {
      ret = obj
    }

    return ret
  }
  return fork
}))