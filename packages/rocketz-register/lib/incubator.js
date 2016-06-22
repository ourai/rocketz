"use strict";

const _ = require("lodash");

const ITEMS = [
  {
    name: "local",
    description: "本地文件所在目录（相对路径）",
    default: "."
  },
  {
    name: "remote",
    description: "远程文件存放目录（相对路径）",
    default: "."
  },
  {
    name: "files",
    description: "限制上传的文件名（无扩展名）",
    default: []
  },
  {
    name: "exts",
    description: "限制上传的扩展名（裸扩展名）",
    default: []
  },
  {
    name: "deep",
    description: "是否深度查找文件",
    default: true
  },
  {
    name: "fragment",
    description: "分段上传时每段的文件数量",
    default: 1
  },
  {
    name: "retryCount",
    description: "上传失败时重试上传次数",
    default: 0
  },
  {
    name: "interactive",
    description: "上传文件时是否进行交互",
    default: true
  },
  {
    name: "accessKey",
    description: "ACCESS KEY",
    default: ""
  },
  {
    name: "secretKey",
    description: "SECRET KEY",
    default: ""
  },
  {
    name: "space",
    description: "存储空间",
    default: ""
  },
  {
    name: "domain",
    description: "访问域名",
    default: ""
  }
];

const ALIAS = {
  retryCount: "retry"
};

const DEFAULTS = getDefaults();

/**
 * 生成默认配置
 *
 * @returns {{}}
 */
function getDefaults() {
  let obj = {};

  _.each(ITEMS, function( item ) {
    obj[item.name] = item.default;
  });

  return obj;
}

/**
 * 去除引号和方括号
 *
 * @param str
 * @returns {*|string|XML|void}
 */
function bare( str ) {
  return str.replace(/[\"\'\[\]]/g, "");
}

class Incubator {
  /**
   * 获取条目
   *
   * @returns {*}
   */
  static items() {
    return _.cloneDeep(ITEMS);
  }

  /**
   * 获取默认配置
   *
   * @returns {*}
   */
  static defaults() {
    return _.cloneDeep(DEFAULTS);
  }

  /**
   * 获取别名
   *
   * @returns {*}
   */
  static alias() {
    return _.cloneDeep(ALIAS);
  }

  /**
   * 将指定配置的值调整成与默认配置的对应值一样的类型
   *
   * @param settings
   * @param defaults
   * @returns {*}
   */
  static normalize( settings, defaults = DEFAULTS ) {
    _.each(settings, function( v, k ) {
      let d = defaults[k];

      if ( _.isString(v) ) {
        v = bare(v);

        if ( _.isArray(d) ) {
          v = v.length ? v.split(",") : [];
        }
        else if ( _.isNumber(d) ) {
          v = Number(v);

          if ( isNaN(v) ) {
            v = d;
          }
        }
        else if ( v === "" && d === "." ) {
          v = d;
        }

        settings[k] = v;
      }

      if ( _.isBoolean(d) ) {
        settings[k] = ["false", false].includes(v) !== true;
      }
    });

    return settings;
  }

  constructor( settings ) {
    this.__defaults = Incubator.defaults();
    this.merge(settings);
  }

  /**
   * 获取当前配置
   *
   * @returns {*}
   */
  get() {
    return _.cloneDeep(this.__settings);
  }

  /**
   * 删除配置中的指定属性
   *
   * @param keys
   * @param settings
   * @returns {boolean}
   */
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

  /**
   * 对有别名的配置项进行属性转换
   *
   * @param settings
   * @param alias
   * @returns {*}
   */
  transform( settings = this.__settings, alias = ALIAS ) {
    _.each(alias, function( v, k ) {
      if ( _.has(settings, k) ) {
        settings[v] = settings[k];
        _.unset(settings, k);
      }
    });

    return settings;
  }

  /**
   * 合并配置
   *
   * @param settings
   * @returns {*}
   */
  merge( ...settings ) {
    if ( !_.isPlainObject(this.__settings) ) {
      settings = [{}, this.__defaults].concat(settings);
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
