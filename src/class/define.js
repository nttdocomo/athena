// This is a plugin, constructed from parts of Backbone.js and John Resig's inheritance script.
// (See http://backbonejs.org, http://ejohn.org/blog/simple-javascript-inheritance/)
// No credit goes to me as I did absolutely nothing except patch these two together.
(function(root, factory) {

  // Set up Backbone appropriately for the environment. Start with AMD.
  if (typeof define === 'function') {

    if (define.amd) {
	    define(['underscore', './class'], factory);
    }

    if (define.cmd) {
      define(function (require, exports, module) {
        return factory(require('underscore'), require('./class'))
      })
    }

  // Next for Node.js or CommonJS.
  } else if (typeof exports !== 'undefined' && typeof require === 'function') {
    factory(require('underscore'), require('./class'))

  // Finally, as a browser global.
  } else {
    factory(root._);
  }

}(this, function (_, Class) {
  return function(className, Parent, data){
    if(_.isObject(className)){
      data = className
    }
    if(_.isString(className)){
      data.$className = className
    }
    return new Class(Parent, data)
  }
}));