"use strict";

const fs = require("fs");
const path = require("path");

const util = require("./util");

// 默认支持的文件类型（扩展名）
const defaultExts = [
    // 常见图片
    "jpg", "jpeg", "png", "gif", "svg",
    // 网络字体
    "eot", "ttf", "woff", "woff2",
    // 前端资源
    "css", "js", "swf"
  ];

/**
 * 判断是否为字符串类型
 *
 * @param obj
 * @returns {boolean}
 */
function isStr( obj ) {
  return typeof obj === "string";
}

/**
 * 判断是否为支持的文件类型
 *
 * @param fileName
 * @param exts
 * @returns {boolean}
 */
function isValidFile( fileName, exts ) {
  return exts.indexOf(path.extname(fileName).slice(1)) > -1;
}

/**
 * 查找收集需要上传的文件
 * 
 * @param assetPath
 * @param basePath
 * @param exts
 * @returns {Array}
 */
function collectAssets( assetPath, basePath, exts ) {
  var assets = [];

  if ( fs.existsSync(assetPath) && fs.statSync(assetPath).isDirectory() ) {
    fs.readdirSync(assetPath).forEach(function( f ) {
      var p;
      var s;

      if ( f.charAt(0) !== "." ) {
        p = path.resolve(assetPath, f);
        s = fs.statSync(p);

        if ( s.isDirectory() ) {
          assets = assets.concat(collectAssets(p, basePath, exts));
        }
        else if ( s.isFile() && isValidFile(f, exts) ) {
          assets.push(p.replace(basePath + "/", ""));
        }
      }
    });
  }

  return assets;
}

module.exports = class Rocket {
  consturctor() {
    this.__exts = util.cloneArr(defaultExts);
  }

  // 收集资源文件
  // 只处理一个目录
  collect( assetDir ) {
    var assets;
    var assetPath;

    if ( isStr(assetDir) ) {
      assetPath = path.resolve(assetDir);
      assets = collectAssets(assetPath, assetPath, this.__exts);
    }
    else {
      assets = [];
    }

    return assets;
  }

  setExts( exts ) {
    if ( isStr(exts) && exts !== "" ) {
      exts = util.toArr(exts);
    }
    else if ( !Array.isArray(exts) || exts.length === 0 ) {
      exts = defaultExts;
    }

    this.__exts = exts;

    return util.cloneArr(exts);
  }
}
