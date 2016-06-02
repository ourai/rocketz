"use strict";

var _ = require("lodash");

module.exports = {
  toArr: function( obj ) {
    if ( !_.isArray(obj) ) {
      obj = [obj]
    }

    return obj;
  },
  cloneArr: function( arr ) {
    return [].concat(arr);
  },
  extendsClass: function( Child, Parent ) {
    var F = function() {};

    F.prototype = Parent.prototype;

    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.__super__ = Parent;

    return Child;
  }
};
