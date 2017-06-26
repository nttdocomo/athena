/* global define */
;(function (root, factory) {
  if (typeof define === 'function') {
    // Now we're wrapping the factory and assigning the return
    // value to the root (window) and returning it as well to
    // the AMD loader.
    if (define.amd) {
      define(['../class', './configurator', '../underscore'], factory)
    }
    if (define.cmd) {
      define(function (require, exports, module) {
        return factory(require('../class'), require('./configurator'), require('../underscore'))
      })
    }
  } else if (typeof module === 'object' && module.exports) {
    // I've not encountered a need for this yet, since I haven't
    // run into a scenario where plain modules depend on CommonJS
    // *and* I happen to be loading in a CJS browser environment
    // but I'm including it for the sake of being thorough
    module.exports = factory(require('../class'), require('./configurator'), require('../underscore'))
  } else {
    root.Class = factory()
  }
}(this, function (Class, Configurator, _) {
  var extend = Class.extend
  Class.extend = function(protoProps, classProps){
    var child = extend.call(this, protoProps)
    if (classProps) _.extend(child, classProps)
    child.config(protoProps)
    return child
  }
  var Base = Class.extend({
    init: function (config) {
      var me = this
      me.initConfig(config)
    },
    getConfigurator: function () {
      return this.$config || this.constructor.getConfigurator()
    },
    initConfig: function(instanceConfig) {
      var me = this
      var cfg = me.getConfigurator()

      me.initConfig = Ext.emptyFn // ignore subsequent calls to initConfig
      me.initialConfig = instanceConfig || {}
      cfg.configure(me, instanceConfig)

      return me
    }
  }, {
    config: function(data){
      this.addConfig(data.config)
      delete data.config;
    },
    addConfig: function(config, mixinClass) {
      var cfg = this.$config || this.getConfigurator()
      cfg.add(config, mixinClass)
    },
    getConfigurator: function(){
      return this.$config || new Configurator(this)
    }
  })
  return Base
}))