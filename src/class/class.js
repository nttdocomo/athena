/* global define */
;(function (root, factory) {
  if (typeof define === 'function') {
    // Now we're wrapping the factory and assigning the return
    // value to the root (window) and returning it as well to
    // the AMD loader.
    if (define.amd) {
      define(['./inherits', './configurator', 'underscore', 'athena'], factory)
    }
    if (define.cmd) {
      define(function (require, exports, module) {
        return factory(require('./inherits'), require('./configurator'), require('underscore'), require('athena'))
      })
    }
  } else if (typeof module === 'object' && module.exports) {
    // I've not encountered a need for this yet, since I haven't
    // run into a scenario where plain modules depend on CommonJS
    // *and* I happen to be loading in a CJS browser environment
    // but I'm including it for the sake of being thorough
    module.exports = factory(require('./inherits'), require('./configurator'), require('underscore'), require('athena'))
  } else {
    root.Class = factory()
  }
}(this, function (inherits, Configurator, _, Athena) {
  var Base = function (config) {
    var me = this
    me.initConfig(config)
  }
  Base.extend = function (protoProps, classProps) {
    var child = inherits(this, protoProps, classProps)
    child.extend = this.extend
    child.getConfigurator()
    child.config(protoProps)
    return child
  }
  _.extend(Base.prototype, {
    initConfig: function(instanceConfig) {
      var me = this
      var cfg = me.constructor.getConfigurator()

      me.initConfig = Athena.emptyFn // ignore subsequent calls to initConfig
      me.initialConfig = instanceConfig || {}
      cfg.configure(me, instanceConfig)

      return me
    }
  })
  _.extend(Base, {
    addConfig: function(config, mixinClass) {
      var cfg = this.$config || this.getConfigurator()
      cfg.add(config, mixinClass)
    },
    config: function(data){
      this.addConfig(data.config)
      delete data.config;
    },
    getConfigurator: function(){
      return this.$config || new Configurator(this)
    }
  })
  return Base
}))