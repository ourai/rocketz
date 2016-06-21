"use strict";

const fs = require("fs");
const path = require("path");

/**
 * 判断目标对象是否具备指定属性
 *
 * @param obj
 * @param prop
 * @returns {boolean}
 */
function hasOwn( obj, prop ) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

/**
 * 使 CDN 配置信息的字段与全局配置相同
 *
 * @param conf
 * @param cdn
 * @returns {*}
 */
function normalize( conf, cdn ) {
  Object.keys(conf).forEach(function( k ) {
    if ( k !== "cdn" && !hasOwn(cdn, k) ) {
      cdn[k] = conf[k];
    }
  });

  return cdn;
}

/**
 * 获取完整的配置信息
 *
 * @param conf
 * @returns {{}|*}
 */
function resolve( conf ) {
  conf = conf === "" ? {} : JSON.parse(conf);

  if ( !hasOwn(conf, "cdn") ) {
    conf.cdn = {};
  }

  return conf;
}

function unique( conf, cdn ) {
  Object.keys(conf).forEach(function( k ) {
    if ( k !== "cdn" && cdn[k] === conf[k] ) {
      delete cdn[k];
    }
  });

  return cdn;
}

/**
 * 克隆一个对象
 *
 * @param obj
 * @returns {{}}
 */
function clone( obj, filter ) {
  if ( typeof obj !== "object" ) {
    return {};
  }

  let copy = {};

  Object.keys(obj).forEach(function( k ) {
    let v = obj[k];

    if ( typeof filter !== "function" || filter.apply(v, [v, k]) === true ) {
      copy[k] = v;
    }
  });

  return copy;
}

class Configurator {
  constructor( env ) {
    this.__env = env;
    this.__conf = resolve(env.configPath ? fs.readFileSync(this.path(), "utf-8") : "");
  }

  /**
   * 获取配置文件路径
   *
   * @returns {string|*}
   */
  path() {
    return this.__env.configPath ? this.__env.configPath : path.join(this.__env.cwd, this.__env.configNameSearch[0]);
  }

  /**
   * 获取精简的配置信息
   *
   * @param cdn
   * @returns {{}}
   */
  get( cdn ) {
    return clone(cdn ? this.__conf.cdn[cdn] : this.__conf);
  }

  merge( conf, cdn ) {
    let saved = this.__conf;
    let c;

    if ( cdn ) {
      if ( !hasOwn(saved.cdn, cdn) ) {
        saved.cdn[cdn] = {};
      }

      c = saved.cdn[cdn];
    }
    else {
      c = saved;
    }

    Object.keys(conf).forEach(function( k ) {
      if ( k !== "cdn" ) {
        c[k] = conf[k];
      }
    });

    if ( cdn ) {
      saved.cdn[cdn] = unique(saved, c);
    }

    return this.get(cdn);
  }
}

module.exports = Configurator;
