"use strict";

const _ = require("lodash");

const utils = require("./utils");
const resolver = require("./resolver");
const Uploader = require("./uploader");

const DEFAULTS = {
    cdn: {}             // 要上传的 CDN
  };
const VALID_CDN = resolver.load();

/**
 * 判断 CDN 是否有效
 *
 * @param cdn
 * @param cdnCollection
 * @returns {boolean}
 */
function isValidCdn( cdn, cdnCollection = VALID_CDN ) {
  return _.isString(cdn) && cdnCollection.hasOwnProperty(cdn);
}

/**
 * 判断 CDN 的配置是否有效
 *
 * @param settings
 * @returns {boolean}
 */
function isValidCdnSettings( settings ) {
  if ( !_.isPlainObject(settings) ) {
    return false;
  }

  let settingKeys = Object.keys(settings);

  return ["accessKey", "secretKey"].every(function( k ) {
      return settingKeys.includes(k);
    });
}

module.exports = class RocketZ {
  /**
   * 初始化配置信息
   *
   * @param rocketzSettings
   */
  constructor( rocketzSettings ) {
    let s = Uploader.normalize({}, DEFAULTS, Uploader.__defaults, rocketzSettings);

    // 全局配置中不需要保留 AK 和 SK
    ["accessKey", "secretKey"].forEach(function( k ) {
      delete s[k];
    });

    this.__settings = s;
  }

  /**
   * 初始化 CDN 的配置
   *
   * @param cdn
   * @param cdnSettings
   */
  init( cdn, cdnSettings ) {
    let cdns = [];

    if ( _.isString(cdn) ) {
      cdns.push({name: cdn, settings: cdnSettings});
    }
    else if ( Array.isArray(cdn) ) {
      cdns = cdn;
    }

    cdns.forEach(( c ) => {
      if ( isValidCdn(c.name) && isValidCdnSettings(c.settings) ) {
        let _s = Uploader.normalize({}, this.__settings, c.settings);
        let _u = VALID_CDN[c.name];

        Object.keys(DEFAULTS).forEach(function( p ) {
          delete _s[p];
        });

        this.__settings.cdn[c.name] = {
          settings: _s,
          uploader: new _u(_s)
        };
      }
    });
  }

  /**
   * 列出可上传文件
   *
   * @param cdn
   * @param forceMap      强制以 map 形式输出
   * @returns {{}}
   */
  list( cdn, forceMap ) {
    let s = this.__settings.cdn;
    let files = {};

    if ( _.isBoolean(cdn) ) {
      forceMap = cdn;
      cdn = undefined;
    }

    let cdns = _.isUndefined(cdn) ? Object.keys(s) : utils.toArr(cdn);

    cdns.forEach(function( c ) {
      if ( _.isString(c) && s.hasOwnProperty(c) ) {
        files[c] = [].concat(s[c].settings.__files);
      }
    });

    return (Object.keys(files).length > 1 || forceMap === true) ? files : files[cdns.shift()];
  }

  /**
   * 获取指定的 CDN 实例
   *
   * @param name
   * @returns {*}
   */
  get( name ) {
    let s = this.__settings.cdn;

    if ( isValidCdn(name, s) ) {
      return s[name].uploader;
    }
    else {
      return null;
    }
  }

  /**
   * 上传文件到指定的 CDN
   *
   * @param cdn
   */
  upload( cdn = Object.keys(this.__settings.cdn) ) {
    utils.toArr(cdn).forEach(( c ) => {
      let u = this.get(c);

      if ( u ) {
        u.upload();
      }
    });
  }
}
