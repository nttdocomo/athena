// This is a plugin, constructed from parts of Backbone.js and John Resig's inheritance script.
// (See http://backbonejs.org, http://ejohn.org/blog/simple-javascript-inheritance/)
// No credit goes to me as I did absolutely nothing except patch these two together.
(function(root, factory) {

  // Set up Backbone appropriately for the environment. Start with AMD.
  if (typeof define === 'function') {

    if (define.amd) {
	    define(['underscore'], function(_) {
	      // Export global even in AMD case in case this script is loaded with
	      // others that may still expect a global Backbone.
	      return factory( _);
	    });
    }

    if (define.cmd) {
      define(function (require, exports, module) {
        return factory(require('underscore'))
      })
    }

  // Next for Node.js or CommonJS.
  } else if (typeof exports !== 'undefined' && typeof require === 'function') {
    var _ = require('underscore')
    factory(_);

  // Finally, as a browser global.
  } else {
    factory(root._);
  }

}(this, function factory(_) {
	return function(Class, data, hooks){
		Class.addMembers(data);
	};
}));