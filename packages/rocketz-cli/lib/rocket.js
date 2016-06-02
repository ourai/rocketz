"use strict";

var fs = require("fs");
var path = require("path");

var util = require("./util");
var _ = require("lodash");

var defaultExts = [
    "jpg", "jpeg", "png", "gif", "svg",
    "eot", "ttf", "woff", "woff2",
    "css",
    "js",
    "swf"
  ];

function isValidFile( fileName, exts ) {
  return exts.indexOf(path.extname(fileName).slice(1)) > -1;
}

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

function Rocket() {
  this.__exts = util.cloneArr(defaultExts);
}

// 收集资源文件
// 只处理一个目录
Rocket.prototype.collect = function( assetDir ) {
  var assets;
  var assetPath;

  if ( _.isString(assetDir) ) {
    assetPath = path.resolve(assetDir);
    assets = collectAssets(assetPath, assetPath, this.__exts);
  }
  else {
    assets = [];
  }

  return assets;
};

Rocket.prototype.setExts = function( exts ) {
  if ( _.isString(exts) && exts !== "" ) {
    exts = util.toArr(exts);
  }
  else if ( !_.isArray(exts) || exts.length === 0 ) {
    exts = defaultExts;
  }

  this.__exts = exts;

  return util.cloneArr(exts);
}

module.exports = Rocket;
