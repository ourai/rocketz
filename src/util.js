"use strict";

import _ from "lodash";

export default {
  toArr: function( obj ) {
    if ( !_.isArray(obj) ) {
      obj = [obj]
    }

    return obj;
  },
  cloneArr: function( arr ) {
    return [].concat(arr);
  }
};
