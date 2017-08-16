/* global define */
;(function (root, factory) {
  if (typeof define === 'function') {
    // Now we're wrapping the factory and assigning the return
    // value to the root (window) and returning it as well to
    // the AMD loader.
    if (define.amd) {
      define(['./inherits', './configurator', './base', 'underscore', 'athena'], factory)
    }
    if (define.cmd) {
      define(function (require, exports, module) {
        return factory(require('./inherits'), require('./configurator'), require('./base'), require('underscore'), require('athena'))
      })
    }
  } else if (typeof module === 'object' && module.exports) {
    // I've not encountered a need for this yet, since I haven't
    // run into a scenario where plain modules depend on CommonJS
    // *and* I happen to be loading in a CJS browser environment
    // but I'm including it for the sake of being thorough
    module.exports = factory(require('./inherits'), require('./configurator'), require('./base'), require('underscore'), require('athena'))
  } else {
    root.Class = factory()
  }
}(this, function (inherits, Configurator, Base, _, Athena) {
  var Klass = function(Parent, data){
    if (!data) {
      data = {};
    }

    var Cls = Klass.create(Parent, data)
    Klass.process(Cls, data);
    return Cls
  }
  _.extend(Klass, {
    create: function (Parent, data) {
      //var i = baseStaticMembers.length
      var name
      var className = data.$className
      delete data.$className

      /*while (i--) {
        name = baseStaticMembers[i];
        Class[name] = Base[name];
      }*/
      var Cls = Parent.extend(_.omit(data, 'config', 'statics'))
      _.extend(Cls, Base, data['statics'])
      //Cls.getConfigurator();
      if(className){
        Cls.$className = className
      }
      return Cls
    },
        
    doProcess: function(Cls, data, hooks) {
      var me = this
      var preprocessors = _.map(me.preprocessors, function(preprocessor){
        return preprocessor.fn
      })
      var preprocessor = preprocessors.shift()
      var doProcess = me.doProcess

      for ( ; preprocessor ; preprocessor = preprocessors.shift()) {
          // Returning false signifies an asynchronous preprocessor - it will call doProcess when we can continue
          if (preprocessor.call(me, Cls, data) === false) {
              return;
          }
      }
      hooks.onBeforeCreated.apply(me, arguments);
    },
    onBeforeCreated: function(Class, data, hooks) {
      //<debug>
      //Ext.classSystemMonitor && Ext.classSystemMonitor(Class, '>> Ext.Class#onBeforeCreated', arguments);
      //</debug>
  
      Class.addMembers(data);

      //hooks.onCreated.call(Class, Class);

      //<debug>
      //Ext.classSystemMonitor && Ext.classSystemMonitor(Class, '<< Ext.Class#onBeforeCreated', arguments);
      //</debug>
    },
    process: function(Cls, data) {
      var hooks = {
        onBeforeCreated: this.onBeforeCreated
      }
      this.doProcess(Cls, data, hooks);
    },
    preprocessors: {},
    registerPreprocessor: function(name, fn) {

      this.preprocessors[name] = {
        name: name,
        fn: fn
      };

      return this;
    }
  })
  /*Klass.registerPreprocessor('statics', function(Cls, data){
    return _.extend(Cls, data['statics'])
  })*/

  Klass.registerPreprocessor('config', function(Cls, data){
    Cls.addConfig(data.config)
    delete data.config;
  })
  return Klass
}))