"use strict";

const fs = require("fs");
const path = require("path");

const _ = require("lodash");

const fc = require("./collector");
const CDN = require("./cdn");

const ROCKETZ_DEFAULTS = {
    cdn: {}             // 要上传的 CDN 名字
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

        Object.keys(ROCKETZ_DEFAULTS).forEach(function( p ) {
          delete _s[p];
        });

        this.__settings.cdn[c.name] = _s;
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
        files[c] = [].concat(s[c].__files);
      }
    });

    return (Object.keys(files).length > 1 || forceMap === true) ? files : files[cdns.shift()];
  }

  /**
   * 上传
   *
   * @param settings
   * @returns {boolean}
   */
  upload( settings ) {
    let rs = this.__settings;       // 'rs' is short for 'rocketzSettings'
    let cs = [];                    // 'cs' is short for 'cdnSettings'

    // 没指定 CDN 时上传到所有可用的 CDN
    if ( settings == null ) {
      settings = Object.keys(rs.cdn);
    }

    // 获取可用的 CDN 配置信息
    toArr(settings).forEach(function( s ) {
      let _s = {};

      if ( isValidCdn(s, rs.cdn) ) {
        _s.name = s;
        _s.settings = _.assign({}, rs.cdn[s]);
      }
      else if ( isValidCdn(s.name, rs.cdn) && isValidCdnSettings(s) ) {
        _s.name = s.name;
        _s.settings = resolveCdnSettings({}, rs.cdn[s.name], s);

        // 删除不必要的属性
        ["name"].forEach(function( p ) {
          delete _s.settings[p];
        });
      }

      if ( Object.keys(_s).length > 0 ) {
        cs.push(_s);
      }
    });

    if ( cs.length === 0 ) {
      return false;
    }

    cs.forEach(function( s ) {
      let Uploader = VALID_CDN[s.name];
      let _s = s.settings;

      _s.files = _s.__files;
      delete _s.__files;

      (new Uploader(_s)).upload();
    });

    return true;
  }
}
