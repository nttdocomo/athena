/* global define */
;(function (root, factory) {
  if (typeof define === 'function') {
    // Now we're wrapping the factory and assigning the return
    // value to the root (window) and returning it as well to
    // the AMD loader.
    if (define.amd) {
      define(['./config', '../lang/object/fork'], factory)
    }
    if (define.cmd) {
      define(function (require, exports, module) {
        return factory(require('./config'), require('../lang/object/fork'))
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
}(this, function (Config, fork) {
  var Configurator = function (cls) {
    var me = this
    var prototype = cls.prototype
    var superCfg = cls.__super__ ? cls.__super__.constructor.$config : null
    me.cls = cls
    me.superCfg = superCfg
    if (superCfg) {
      /**
       * This object holds an `Ext.Config` value for each config property keyed by name.
       * This object has as its prototype object the `configs` of its super class.
       * 
       * This map is maintained as each property is added via the `add` method.
       * 
       * @property {Object} configs
       * @private
       * @readonly
       */
      me.configs = Object.create(superCfg.configs)
      /**
       * This object holds a bool value for each cachedConfig property keyed by name.
       * 
       * This map is maintained as each property is added via the `add` method.
       * 
       * @property {Object} cachedConfigs
       * @private
       * @readonly
       */
      me.cachedConfigs = Object.create(superCfg.cachedConfigs)
      /**
       * This object holds a `Number` for each config property keyed by name. This object has
       * as its prototype object the `initMap` of its super class. The value of each property
       * has the following meaning:
       * 
       *   * `0` - initial value is `null` and requires no processing.
       *   * `1` - initial value must be set on each instance.
       *   * `2` - initial value can be cached on the prototype by the first instance.
       *
       * Any `null` values will either never be added to this map or (if added by a base
       * class and set to `null` by a derived class) will cause the entry to be 0.
       * 
       * This map is maintained as each property is added via the `add` method.
       * 
       * @property {Object} initMap
       * @private
       * @readonly
       */
      me.initMap = Object.create(superCfg.initMap)
      /**
       * This object holds the default value for each config property keyed by name. This
       * object has as its prototype object the `values` of its super class.
       * 
       * This map is maintained as each property is added via the `add` method.
       * 
       * @property {Object} values
       * @private
       * @readonly
       */
      me.values = Object.create(superCfg.values)
      me.needsFork = superCfg.needsFork;
      // The reason this feature is debug only is that we would have to create this
      // map for all classes because deprecations could be added to bases after the
      // derived class had created its Configurator.
      me.deprecations = Object.create(superCfg.deprecations)
    } else {
      me.configs = {}
      me.cachedConfigs = {}
      me.initMap = {}
      me.values = {}
      me.deprecations = {}
    }
    prototype.config = prototype.defaultConfig = me.values
    cls.$config = me
  }
  Configurator.prototype = {
    add: function (config, mixinClass) {
      var me = this
      var Cls = me.cls
      var configs = me.configs
      var values = me.values
      var initMap = me.initMap
      var prototype = Cls.prototype
      var value, isObject, cfg, currentValue, merge, mixinConfigs, isCached, s
      for (name in config) {
        value = config[name]
        isObject = _.isObject(value)
        meta = isObject && '$value' in value ? value : null;
        isCached = false
        cfg = configs[name]
        if (cfg) {
          currentValue = values[name]
          if (merge) {
            value = merge.call(cfg, value, currentValue, Cls, mixinClass)
          } else if (isObject) {
            if (currentValue && currentValue.constructor === Object) {
              // We favor moving the cost of an "extra" copy here because this
              // is likely to be a rare thing two object values for the same
              // property. The alternative would be to clone the initial value
              // to make it safely modifiable even though it is likely to never
              // need to be modified.
              value = ExtObject.merge({}, currentValue, value)
            }
              // else "currentValue" is a primitive so "value" can just replace it
          }
        } else {
          // This is a new property value, so add it to the various maps "as is".
          // In the majority of cases this value will not be overridden or need to
          // be forked.
          if (mixinConfigs) {
            // Since this is a config from a mixin, we don't want to apply its
            // meta-ness because it already has. Instead we want to use its cfg
            // instance:
            cfg = mixinConfigs[name];
            meta = null;
          } else {
            cfg = Config.get(name);
          }

          configs[name] = cfg;
          if (cfg.cached || isCached) {
            cachedConfigs[name] = true;
          }

          // Ensure that the new config has a getter and setter. Because this method
          // is called during class creation as the "config" (or "cachedConfig") is
          // being processed, the user's methods will not be on the prototype yet.
          // 
          // This has the following trade-offs:
          // 
          // - Custom getters are rare so there is minimal waste generated by them.
          // 
          // - Custom setters are more common but, by putting the default setter on
          //   the prototype prior to addMembers, when the user methods are added
          //   callParent can be used to call the generated setter. This is almost
          //   certainly desirable as the setter has some very important semantics
          //   that a custom setter would probably want to preserve by just adding
          //   logic before and/or after the callParent.
          //   
          // - By not adding these to the class body we avoid all the "is function"
          //   tests that get applied to each class member thereby streamlining the
          //   downstream class creation process.
          //
          // We still check for getter and/or setter but primarily for reasons of
          // backwards compatibility and "just in case" someone relied on inherited
          // getter/setter even though the base did not have the property listed as
          // a "config" (obscure case certainly).
          //
          names = cfg.names;
          if (!prototype[s = names.get]) {
            prototype[s] = cfg.getter || cfg.getGetter();
          }
          s = names.set
          if (!prototype[s]) {
            prototype[s] = (meta && meta.evented) ? (cfg.eventedSetter || cfg.getEventedSetter())
                : (cfg.setter || cfg.getSetter());
          }
        }
        // If the value is non-null, we need to initialize it.
        if (value !== null) {
          initMap[name] = true
        } else {
          if (prototype.$configPrefixed) {
            prototype[configs[name].names.internal] = null
          } else {
            prototype[configs[name].name] = null
          }
          if (name in initMap) {
            // Only set this to false if we already have it in the map, otherwise, just leave it out!
            initMap[name] = false
          }
        }
        values[name] = value
      }
    },
    configure: function (instance, instanceConfig) {
      var me = this
      var configs = me.configs
      var initMap = me.initMap
      var initList = me.initList
      var values = me.values
      var prototype = me.cls.prototype
      var firstInstance = !initList
      var values = me.needsFork ? fork(values) : Object.create(values)
      var isCached, ln, internalName, cachedInitList
      instance.isConfiguring = true
      if (firstInstance) {
        // When called to configure the first instance of the class to which we are
        // bound we take a bit to plan for instance 2+.
        me.initList = initList = []
        me.initListMap = initListMap = {}
        instance.isFirstInstance = true

        for (name in initMap) {
          cfg = configs[name]
          isCached = cfg.cached

          if (initMap[name]) {
            names = cfg.names
            value = values[name]

            if (!prototype[names.set].$isDefault/* if the set method is not create by the makeSetter */ || 
              prototype[names.apply] || 
              prototype[names.update] || 
              typeof value === 'object') {
              if (isCached) {
                // This is a cachedConfig, so it needs to be initialized with
                // the default value and placed on the prototype... but the
                // instanceConfig may have a different value so the value may
                // need resetting. We have to defer the call to the setter so
                // that all of the initGetters are set up first.
                (cachedInitList || (cachedInitList = [])).push(cfg)
              } else {
                // Remember this config so that all instances (including this
                // one) can invoke the setter to properly initialize it.
                initList.push(cfg)
                initListMap[name] = true
              }

              // Point all getters to the initGetters. By doing this here we
              // avoid creating initGetters for configs that don't need them
              // and we can easily pick up the cached fn to save the call.
              instance[names.get] = cfg.initGetter || cfg.getInitGetter()
            } else {
              // Non-object configs w/o custom setter, applier or updater can
              // be simply stored on the prototype.
              prototype[cfg.getInternalName(prototype)] = value
            }
          } else if (isCached) {
            prototype[cfg.getInternalName(prototype)] = undefined
          }
        }
      }
      ln = cachedInitList && cachedInitList.length
      if (ln) {
        // This is only ever done on the first instance we configure. Any config in
        // cachedInitList has to be set to the default value to allow any side-effects
        // or transformations to occur. The resulting values can then be elevated to
        // the prototype and this property need not be initialized on each instance.

        for (i = 0; i < ln; ++i) {
          internalName = cachedInitList[i].getInternalName(prototype)
          // Since these are cached configs the base class will potentially have put
          // its cached values on the prototype so we need to hide these while we
          // run the inits for our cached configs.
          instance[internalName] = null;
        }

        for (i = 0; i < ln; ++i) {
          names = (cfg = cachedInitList[i]).names
          getter = names.get

          if (instance.hasOwnProperty(getter)) {
            instance[names.set](values[cfg.name])
            delete instance[getter]
          }
        }

        for (i = 0; i < ln; ++i) {
          internalName = cachedInitList[i].getInternalName(prototype)
          prototype[internalName] = instance[internalName]
          delete instance[internalName]
        }

        // The cachedConfigs have all been set to the default values including any of
        // those that may have been triggered by their getter.
      }
      delete instance.isConfiguring
    }
  }
  return Configurator
}))