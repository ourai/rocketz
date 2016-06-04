"use strict";

const fs = require("fs");
const path = require("path");

const fc = require("./collector");
const CDN = require("./cdn");

const DEFAULTS = {
    files: [],      // 限制上传的文件名（无扩展名）
    exts: [],       // 限制上传的扩展名（裸扩展名）
    deep: true,     // 是否深度查找
    local: "",      // 本地文件所在目录
    remote: "",     // 远程文件存放目录
    fragment: 1,    // 分段上传时每段的文件数量
    retryCount: 0,  // 上传失败时重试上传次数
    cdn: "",        // 要上传的 CDN 名字
    accessKey: "",  // 上传到 CDN 时所需的 Access Key
    secretKey: "",  // 上传到 CDN 时所需的 Secret Key
    space: ""       // 上传到 CDN 的空间名
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

function toArr( obj ) {
  if ( !Array.isArray(obj) ) {
    if ( typeof obj === "string") {
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
 * 合并配置
 *
 * @param target
 * @param source
 * @returns {{}}
 */
function mergeSettings( target, source ) {
  let s = {};

  if ( typeof target !== "object" ) {
    return s;
  }

  Object.keys(source).forEach(function( k ) {
    s[k] = target.hasOwnProperty(k) ? target[k] : source[k];
  });

  return s;
}

module.exports = class RocketZ {
  constructor( settings ) {
    let s = mergeSettings(settings, DEFAULTS);

    s.deep = s.deep !== false;
    s.files = fc.collect(path.resolve(s.local), toArr(s.files), toArr(s.exts), s.deep);

    this.__settings = s;
  }

  init() {}

  /**
   * 列出所有可上传文件
   *
   * @returns {Array.<*>}
   */
  list() {
    return [].concat(this.__settings.files);
  }

  /**
   * 上传
   *
   * @returns {boolean}
   */
  upload( settings ) {
    let s = mergeSettings(settings, this.__settings);

    s.cdn = String(s.cdn);

    if ( Object.keys(VALID_CDN).length === 0 || !VALID_CDN.hasOwnProperty(s.cdn) || s.files.length === 0 ) {
      return false;
    }

    [{k: "fragment", v: 1}, {k: "retryCount", v: 0}].forEach(function( o ) {
      s[o.k] = minimalValue(s[o.k], o.v);
    });

    s.local = path.resolve(s.local);

    (new VALID_CDN[s.cdn](s)).upload();

    return true;
  }
}
