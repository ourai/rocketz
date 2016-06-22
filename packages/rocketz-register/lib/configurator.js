"use strict";

const fs = require("fs");
const path = require("path");

const _ = require("lodash");

const Incubator = require("./incubator");

const EXCLUDES = ["accessKey", "secretKey"];

/**
 * 获取配置文件路径
 *
 * @param env
 * @returns {*|string}
 */
function getPath( env ) {
  return env.configPath ? env.configPath : path.join(env.cwd, env.configNameSearch[0]);
}

/**
 * 获取完整的配置信息
 *
 * @param conf
 * @returns {{}|*}
 */
function resolve( conf ) {
  conf = conf === "" ? {} : JSON.parse(conf);

  if ( !_.has(conf, "cdn") ) {
    conf.cdn = {};
  }

  return conf;
}

/**
 * 对子配置项进行去重
 *
 * @param conf
 * @param cdn
 * @returns {*}
 */
function unique( conf, cdn ) {
  Object.keys(conf).forEach(function( k ) {
    if ( k !== "cdn" && cdn[k] === conf[k] ) {
      _.unset(cdn, k);
    }
  });

  return cdn;
}

class Configurator extends Incubator {
  /**
   * 将条目进行分组
   *
   * @returns {*[]}
   */
  static group() {
    let alias = Incubator.alias();
    let grouped = [
      [],                 // 通用条目
      []                  // CDN 特有条目
    ];

    _.each(Incubator.items(), function( item ) {
      let g = grouped[EXCLUDES.includes(item.name) ? 1 : 0];

      if ( _.has(alias, item.name) ) {
        item.name = alias[item.name];
      }

      g.push(item);
    });

    return grouped;
  }

  constructor( env ) {
    super(resolve(env.configPath ? fs.readFileSync(getPath(env), "utf-8") : ""));

    _.each(["defaults", "settings"], ( v, k ) => {
      let o = this[`__${v}`];

      this.transform(o);
      this.unset(EXCLUDES, o);
    });

    this.__env = env;
  }

  /**
   * 获取配置文件路径
   *
   * @returns {string|*}
   */
  path() {
    return getPath(this.__env);
  }

  /**
   * 获取精简的配置信息
   *
   * @param cdn
   * @returns {{}}
   */
  get( cdn ) {
    return _.cloneDeep(cdn ? this.__settings.cdn[cdn] : this.__settings);
  }

  /**
   * 合并配置
   *
   * @param conf
   * @param cdn
   * @returns {*}
   */
  merge( conf, cdn ) {
    if ( !_.has(this, "__settings") ) {
      return super.merge(conf);
    }

    let saved = this.__settings;
    let c;

    if ( cdn ) {
      if ( !_.has(saved.cdn, cdn) ) {
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
