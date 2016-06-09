module.exports = {
  /**
   * 将目标对象转化为数组
   *
   * @param obj
   * @returns {*}
   */
  toArr: function( obj ) {
    if ( !Array.isArray(obj) ) {
      if ( typeof obj === "string" ) {
        obj = obj === "" ? [] : obj.split(",");
      }
      else {
        obj = [].concat(obj);
      }
    }

    return obj;
  }
};
