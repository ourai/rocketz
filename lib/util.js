"use strict";

module.exports = {
  toArr: function( obj ) {
    if ( !Array.isArray(obj) ) {
      obj = [obj]
    }

    return obj;
  },
  cloneArr: function( arr ) {
    return [].concat(arr);
  }
};
