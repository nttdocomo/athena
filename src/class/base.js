/* global define */
;(function (root, factory) {
  if (typeof define === 'function') {
    // Now we're wrapping the factory and assigning the return
    // value to the root (window) and returning it as well to
    // the AMD loader.
    if (define.amd) {
      define(['../class', './configurator', './onBeforeCreated', 'underscore', 'athena'], factory)
    }
    if (define.cmd) {
      define(function (require, exports, module) {
        return factory(require('../class'), require('./configurator'), require('./onBeforeCreated'), require('underscore'), require('athena'))
      })
    }
  } else if (typeof module === 'object' && module.exports) {
    // I've not encountered a need for this yet, since I haven't
    // run into a scenario where plain modules depend on CommonJS
    // *and* I happen to be loading in a CJS browser environment
    // but I'm including it for the sake of being thorough
    module.exports = factory(require('../class'), require('./configurator'), require('./onBeforeCreated'), require('underscore'), require('athena'))
  } else {
    root.Class = factory()
  }
}(this, function (Class, Configurator, onBeforeCreated, _, Athena) {
  var Base = Class.extend()
  _.extend(Base, {
    addConfig: function(config, mixinClass) {
      var cfg = this.$config || this.getConfigurator()
      cfg.add(config, mixinClass)
    },
    addMembers: function(members, isStatic, privacy){
      var me = this
      var target = isStatic ? me : me.prototype
      var defaultConfig = !isStatic && target.defaultConfig
      var member, configs
      for (name in members) {
        if (members.hasOwnProperty(name)) {
          member = members[name]
          if (typeof member === 'function' && !member.$isClass && !member.$nullFn) {

          } else if (defaultConfig && (name in defaultConfig) && !target.config.hasOwnProperty(name)) {
            // This is a config property so it must be added to the configs
            // collection not just smashed on the prototype...
            (configs || (configs = {}))[name] = member
            continue
          }
        }
      }
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