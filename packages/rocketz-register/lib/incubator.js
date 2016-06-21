"use strict";

const _ = require("lodash");

const DEFAULTS = {
  local: "",          // 本地文件所在目录
  remote: "",         // 远程文件存放目录
  files: [],          // 限制上传的文件名（无扩展名）
  exts: [],           // 限制上传的扩展名（裸扩展名）
  deep: true,         // 是否深度查找
  fragment: 1,        // 分段上传时每段的文件数量
  retryCount: 0,      // 上传失败时重试上传次数
  accessKey: "",      // Access Key
  secretKey: "",      // Secret Key
  space: "",          // 空间名
  domain: ""          // 域名
};
const ALIAS = {
  retryCount: "retry"
};

_.each(DEFAULTS, function( v, k ) {
  Object.defineProperty(DEFAULTS, k, {
    configurable: false,
    writable: false
  });
});

class Incubator {
  static defaults() {
    return _.cloneDeep(DEFAULTS);
  }

  static alias() {
    return _.cloneDeep(ALIAS);
  }

  constructor( settings ) {
    this.merge(settings);
  }

  get() {
    return _.cloneDeep(this.__settings);
  }

  unset( keys, settings = this.__settings ) {
    if ( !_.isArray(keys) || !_.isPlainObject(settings) ) {
      return false;
    }

    _.each(keys, function( k ) {
      if ( _.has(settings, k) ) {
        _.unset(settings, k);
      }
    });
  }

  transform( settings = this.__settings, alias = ALIAS ) {
    _.each(alias, function( v, k ) {
      if ( _.has(settings, k) ) {
        settings[v] = settings[k];
        _.unset(settings, k);
      }
    });

    return settings;
  }

  merge( ...settings ) {
    if ( !_.isPlainObject(this.__settings) ) {
      settings = [{}, DEFAULTS].concat(settings);
    }

    this.__settings = this.transform(_.assign(this.__settings, ...settings), _.invert(ALIAS));

    return this.get();
  }

  attach( name, settings ) {
    if ( _.isString(name) ) {
      this.__settings[name] = settings;
    }
  }
}

module.exports = Incubator;
