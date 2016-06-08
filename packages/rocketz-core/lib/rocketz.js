"use strict";

const fs = require("fs");
const path = require("path");

const _ = require("lodash");

const fc = require("./collector");
const CDN = require("./cdn");

const ROCKETZ_DEFAULTS = {
    cdn: {}             // 要上传的 CDN
  };
const CDN_DEFAULTS = {
    accessKey: "",      // Access Key
    secretKey: "",      // Secret Key
    space: "",          // 空间名
    remote: "",         // 远程文件存放目录
    local: "",          // 本地文件所在目录
    files: [],          // 限制上传的文件名（无扩展名）
    exts: [],           // 限制上传的扩展名（裸扩展名）
    deep: true,         // 是否深度查找
    fragment: 1,        // 分段上传时每段的文件数量
    retryCount: 0       // 上传失败时重试上传次数
  };
const VALID_PLUGINS = require("./resolve")();
const VALID_CDN = {};

// 挂载插件
Object.keys(VALID_PLUGINS).forEach(function( pkgPath ) {
    let descriptor = require(VALID_PLUGINS[pkgPath]);

    if ( descriptor && descriptor.type === "cdn" ) {
      VALID_CDN[descriptor.name] = descriptor.register(CDN)
    }
  });

/**
 * 将目标对象转化为数组
 *
 * @param obj
 * @returns {*}
 */
function toArr( obj ) {
  if ( !Array.isArray(obj) ) {
    if ( _.isString(obj) ) {
      obj = obj === "" ? [] : obj.split(",");
    }
    else {
      obj = [].concat(obj);
    }
  }

  return obj;
}

/**
 * 设置不低于最小值的值
 *
 * @param value
 * @param minimal
 * @returns {number|*}
 */
function minimalValue( value, minimal ) {
  value = Number(value);

  return !isNaN(value) && value > minimal ? value : minimal;
}

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

/**
 * 整理成所需要的 CDN 配置
 *
 * @param settings
 */
function resolveCdnSettings( ...settings ) {
  let newestSettings = settings[settings.length - 1];
  let refactor = ["files", "exts", "local", "deep"].map(function( p ) {
      return {
        key: p,
        value: newestSettings[p],
        handler: (p === "local" ? path.resolve :
          (p === "deep" ? function( idDeep ) {
            return idDeep !== false;
          } : toArr))
      };
    });
  let cdnSettings = _.assign(...settings);
  let isCollect = false;

  // 获取要上传的文件
  refactor.forEach(function( o ) {
    if ( newestSettings.hasOwnProperty(o.key) ) {
      isCollect = true;
      cdnSettings[o.key] = o.handler(o.value);
    }
  });

  [{k: "fragment", v: 1}, {k: "retryCount", v: 0}].forEach(function( o ) {
    cdnSettings[o.k] = minimalValue(cdnSettings[o.k], o.v);
  });

  if ( isCollect ) {
    cdnSettings.__files = fc.collect(cdnSettings.local, cdnSettings.files, cdnSettings.exts, cdnSettings.deep);
  }

  return cdnSettings;
}

module.exports = class RocketZ {
  /**
   * 初始化配置信息
   *
   * @param rocketzSettings
   */
  constructor( rocketzSettings ) {
    let s = resolveCdnSettings({}, ROCKETZ_DEFAULTS, CDN_DEFAULTS, rocketzSettings);

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
        let _s = resolveCdnSettings({}, this.__settings, c.settings);
        let _u = VALID_CDN[c.name];

        Object.keys(ROCKETZ_DEFAULTS).forEach(function( p ) {
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

    let cdns = _.isUndefined(cdn) ? Object.keys(s) : toArr(cdn);

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
  cdn( name ) {
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
    toArr(cdn).forEach(( c ) => {
      let u = this.cdn(c);

      if ( u ) {
        u.upload();
      }
    });
  }
}
