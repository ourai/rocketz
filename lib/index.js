"use strict";

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const _ = require("lodash");

const Rocket = require("./rocket");
const Qiniu = require("./qiniu");
const Wantu = require("./wantu");

const log = require("./log");
const util = require("./util");
const confParser = require("./config");

const rocket = new Rocket();

var rocketz = {};

function minimalValue( value, minimal ) {
  return _.isNumber(value) && value > minimal ? value : minimal;
}

/**
 * 初始化
 */
rocketz.init = function( conf ) {
  var targetFiles = util.toArr(conf.files || []);
  var isDeep = conf.deep !== false;
  var clouds = ["qiniu", "wantu"];
  var assets;

  rocket.setExts(conf.exts);

  if ( !(conf && typeof conf === "object") ) {
    conf = {};
  }

  clouds.forEach(function( cloudType ) {
    var c = conf[cloudType];

    if ( c !== false && !_.isPlainObject(c) ) {
      conf[cloudType] = confParser.getConfig(cloudType);
    }
  });

  assets = rocket.collect(conf.assets);

  if ( targetFiles.length ) {
    this.__assets = assets.filter(function( file ) {
      return targetFiles.indexOf(path.basename(file, path.extname(file))) > -1 && (isDeep || path.dirname(file) === ".");
    });
  }
  else {
    this.__assets = assets;
  }

  this.__conf = conf;
  this.__clouds = clouds;
};

/**
 * 预览
 */
rocketz.preview = function() {
  var assets = this.__assets;

  if ( assets.length === 0 ) {
    log.empty();

    return false;
  }
  else {
    log.files(assets, path.resolve(this.__conf.assets));

    return true;
  }
};

/**
 * 上传
 */
rocketz.upload = function() {
  var conf = this.__conf;
  var assets = this.__assets;
  var constructors = {
    qiniu: Qiniu,
    wantu: Wantu
  };
  var spaceKeys = {
    qiniu: "bucket",
    wantu: "namespace"
  };

  if ( !conf ) {
    return false;
  }

  this.__clouds.forEach(function( cloud ) {
    var cloudConf = conf[cloud];

    if ( cloudConf ) {
      (new constructors[cloud]({
          ACCESS_KEY: cloudConf.access_key,
          SECRET_KEY: cloudConf.secret_key,
          space: cloudConf[spaceKeys[cloud]],
          fragment: minimalValue(conf.fragment, 1),
          retryCount: minimalValue(conf.retry, 0),
          interactive: conf.interactive !== false,
          files: assets,
          local: path.resolve(conf.assets),
          remote: conf.remote || ""
        }))
        .upload();
    }
  });

  return true;
};

/**
 * 运行
 */
rocketz.run = function() {
  var assetCount = this.__assets.length;
  var rl;

  if ( this.__conf ) {
    if ( this.__conf.interactive === false ) {
      rocketz.upload();
    }
    else {
      rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.setPrompt(
        "\nWould you want to upload the " + (assetCount === 1 ? "file" : (assetCount + " files")) + " above?" +
        " 'Y' to continue or any other key to quit:"
      );
      rl.prompt();

      rl.on("line", function( line ) {
        if ( line.trim().toLowerCase() === "y" ) {
          rocketz.upload();
        }
        else {
          log.abort();
        }

        rl.close();
      });
    }
  }
};

/**
 * 获取 CDN 配置
 */
rocketz.getCloud = confParser.getConfig;

module.exports = rocketz;
