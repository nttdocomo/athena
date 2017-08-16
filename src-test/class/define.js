"use strict";
(function (root, factory) {
  if(typeof define === "function"){
    if(define.amd) {
      // Now we're wrapping the factory and assigning the return
      // value to the root (window) and returning it as well to
      // the AMD loader.
      define(['../../src/class/define', '../../src/class/base'], factory)
    }
    if(define.cmd){
      define(function(require, exports, module){
        return factory(require('../../src/class/define'), require('../../src/class/base'))
      })
    }
  } else if(typeof module === "object" && module.exports) {
    // I've not encountered a need for this yet, since I haven't
    // run into a scenario where plain modules depend on CommonJS
    // *and* I happen to be loading in a CJS browser environment
    // but I'm including it for the sake of being thorough
    module.exports = factory(require('../../src/class/define'), require('../../src/class/base'))
  } else {
    root.Class = factory();
  }
}(this, function(define, Class) {
  var A = define('A', Class, {
  	config: {
  		a:1
  	},
  	a: 1,
  	statics: {
  		a: '1'
  	}
  })
  var a = new A()
  var B = define('B', A, {
    a:2,
  	config: {
  		b:2
  	},
  	b: 2,
  	statics: {
  		b: '2'
  	}
  })
  var b = new B()
  console.log(a)
  //console.log(A.$config instanceof Configurator)
  var run = function() {
    QUnit.test("define", function( assert ) {
      assert.strictEqual(A.$className, 'A', 'A的$className属性值为"A"' )
      assert.strictEqual(B.$className, 'B', 'B的$className属性值为"B"' )
      assert.strictEqual(A.a, '1', 'A的a静态属性值为"1"' )
      assert.strictEqual(B.b, '2', 'B的b静态属性值为"2"' )
      assert.strictEqual(a.a, 1, 'a的a属性值为1' )
      assert.strictEqual(b.b, 2, 'b的b属性值为2' )
      assert.strictEqual(b.getA(), 2, 'b的getB方法返回值为2' )
    });
  };
  return {run: run}
}))
