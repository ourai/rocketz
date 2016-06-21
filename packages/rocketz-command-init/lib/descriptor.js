"use strict";

const fs = require("fs");
const path = require("path");

const _ = require("lodash");

const DEFAULTS = [
  {
    name: "local",
    description: "本地资源文件目录（相对路径）",
    default: "."
  },
  {
    name: "remote",
    description: "CDN 目标目录（相对路径）",
    default: "."
  },
  {
    name: "files",
    description: "限制上传的文件名",
    default: ""
  },
  {
    name: "exts",
    description: "限制上传的扩展名",
    default: ""
  },
  {
    name: "deep",
    description: "是否深度查找文件",
    default: "true"
  },
  {
    name: "fragment",
    description: "分段上传时每段的文件数量",
    default: "1"
  },
  {
    name: "retry",
    description: "上传失败时重试上传次数",
    default: "0"
  },
  {
    name: "interactive",
    description: "上传文件时是否进行交互",
    default: "true"
  }
];
const AUTH = [
  {
    name: "accessKey",
    description: "Access Key",
    default: ""
  },
  {
    name: "secretKey",
    description: "Secret Key",
    default: ""
  },
  {
    name: "space",
    description: "存储空间",
    default: ""
  },
  {
    name: "domain",
    message: "访问域名：",
    default: ""
  }
];

const descriptor = {
  name: "init",
  type: "command",
  description: "Initialize settings"
};

function transform( items, conf ) {
  return items.map(function( item ) {
    return {
      name: item.name,
      message: `${item.description}：`,
      default: _.has(conf, item.name) ? conf[item.name] : item.default,
      type: "input"
    }
  })
}

function normalize( savedConf, cdnConf ) {
  let items = _.concat(DEFAULTS);

  if ( !_.has(cdnConf, "cdn") ) {
    items = _.concat(AUTH, items);
  }

  return transform(items, _.assign({}, savedConf, cdnConf));
}

descriptor.register = function ( Commander ) {
  return function( argv, flags, env ) {
    let configurator = new Commander.Configurator(env);
    let cdnName = argv[0];
    let conf = configurator.get();

    Commander
      .prompt(normalize(conf, configurator.get(cdnName)))
      .then(function( answers ) {
        _.each(answers, function( v, k ) {
          if ( _.isString(v) ) {
            answers[k] = v.replace("\"\"", "");
          }

          if ( ["deep", "interactive"].includes(k) ) {
            answers[k] = ["false", false].includes(v) !== true;
          }
        });

        configurator.merge(answers, cdnName);

        fs.writeFileSync(configurator.path(), JSON.stringify(configurator.get(), null, 2));
      });
  }
};

module.exports = descriptor;
