/* global define */
;(function (root, factory) {
  if (typeof define === 'function') {
    // Now we're wrapping the factory and assigning the return
    // value to the root (window) and returning it as well to
    // the AMD loader.
    if (define.amd) {
      define(/*['./polyfill/object/create'], */function (inherits) {
        return (root.Class = factory(inherits))
      })
    }
    if (define.cmd) {
      define(function (require, exports, module) {
        return (root.Class = factory(/*require('./polyfill/object/create')*/))
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
}(this, function (create) {
  var Config = function (name) {
    var me = this
    var capitalizedName = name.charAt(0).toUpperCase() + name.substr(1)

    /**
     * @property {String} name
     * The name of this config property.
     * @readonly
     * @private
     * @since 5.0.0
     */
    me.name = name;

    /**
     * @property {Object} names
     * This object holds the cached names used to lookup properties or methods for this
     * config property. The properties of this object are explained in the context of an
     * example property named "foo".
     *
     * @property {String} names.internal The default backing property ("_foo").
     *
     * @property {String} names.initializing The property that is `true` when the config
     * is being initialized ("isFooInitializing").
     *
     * @property {String} names.apply The name of the applier method ("applyFoo").
     *
     * @property {String} names.update  The name of the updater method ("updateFoo").
     *
     * @property {String} names.get The name of the getter method ("getFoo").
     *
     * @property {String} names.set The name of the setter method ("setFoo").
     *
     * @property {String} names.initGet The name of the initializing getter ("initGetFoo").
     *
     * @property {String} names.changeEvent The name of the change event ("foochange").
     *
     * @readonly
     * @private
     * @since 5.0.0
     */
    me.names = {
      internal: '_' + name,
      initializing: 'is' + capitalizedName + 'Initializing',
      apply: 'apply' + capitalizedName,
      update: 'update' + capitalizedName,
      get: 'get' + capitalizedName,
      set: 'set' + capitalizedName,
      initGet: 'initGet' + capitalizedName,
      changeEvent: name.toLowerCase() + 'change'
    };

    // This allows folks to prototype chain on top of these objects and yet still cache
    // generated methods at the bottom of the chain.
    me.root = me;
  }
  Config.prototype = {
    /**
     * Returns the name of the property that stores this config on the given instance or
     * class prototype.
     * @param {Object} target
     * @return {String}
     */
    getInternalName: function (target) {
      return target.$configPrefixed ? this.names.internal : this.name
    },
    getGetter: function () {
      return this.getter || (this.root.getter = this.makeGetter())
    },
    
    getInitGetter: function () {
      return this.initGetter || (this.root.initGetter = this.makeInitGetter())
    },

    getSetter: function () {
      return this.setter || (this.root.setter = this.makeSetter())
    },
    makeGetter: function () {
      var name = this.name
      var prefixedName = this.names.internal

      return function () {
        var internalName = this.$configPrefixed ? prefixedName : name
        return this[internalName]
      }
    },

    makeSetter: function () {
      var name = this.name
      var names = this.names
      var prefixedName = names.internal
      var getName = names.get
      var applyName = names.apply
      var updateName = names.update
      var setter

      // http://jsperf.com/method-call-apply-or-direct
      // http://jsperf.com/method-detect-invoke
      setter = function (value) {
        var me = this
        var internalName = me.$configPrefixed ? prefixedName : name
        var oldValue = me[internalName]

        // Remove the initGetter from the instance now that the value has been set.
        delete me[getName]

        if (!me[applyName] || (value = me[applyName](value, oldValue)) !== undefined) {
          // The old value might have been changed at this point
          // (after the apply call chain) so it should be read again
          if (value !== (oldValue = me[internalName])) {
            me[internalName] = value;

            if (me[updateName]) {
              me[updateName](value, oldValue)
            }
          }
        }

        return me;
      };

      setter.$isDefault = true

      return setter
    }
  }
  Config.map = {}
  Config.get = function (name) {
    var map = Config.map
    var ret = map[name] || (map[name] = new Config(name))

    return ret
  };
  return Config
}))