"use strict";

const path = require("path");
const fs = require("fs");

const findSync = require("find-up").sync;

const Commander = require("./commander");
const Uploader = require("./uploader");

const APP_NAME = "rocketz";
const PACKAGE_DIR = "node_modules";
const PLUGIN_TYPES = ["cdn", "command"];

const pkgs = {};

/**
 * 查找插件
 *
 * @param dir
 */
function findPackages( dir ) {
  if ( !fs.existsSync(dir) || path.resolve(dir) === process.env.HOME ) {
    return;
  }

  fs
    .readdirSync(dir)
    .filter(function( dirname ) {
      return (new RegExp(`^${APP_NAME}-${PLUGIN_TYPES.join("|")}-`)).test(dirname) && !pkgs[dirname];
    })
    .forEach(function( plugin ) {
      pkgs[plugin] = path.resolve(dir, plugin);
    });
}

/**
 * 收集插件
 */
function collectPackages( cwd ) {
  let localPath = findSync(PACKAGE_DIR, {cwd: cwd});

  if ( require(path.join(path.dirname(localPath), "package.json")).name === APP_NAME ) {
    localPath = findSync(PACKAGE_DIR, {cwd: path.join(localPath, "../..")});
  }

  [localPath, findSync(PACKAGE_DIR, {cwd: path.join(process.env._, "../../lib")})].forEach(findPackages);
}

module.exports = {
  __cwd: __dirname,

  cwd: function( cwd ) {
    if ( typeof cwd === "string" ) {
      this.__cwd = cwd;
    }

    return this.__cwd;
  },

  /**
   * 挂载插件
   *
   * @param type
   * @returns {{}}
   */
  load: function( type ) {
    let plugins = {};

    PLUGIN_TYPES.forEach(function( t ) {
      plugins[t] = {};
    });

    collectPackages(this.__cwd);

    Object.keys(pkgs).forEach(( pkgPath ) => {
      let descriptor = require(pkgs[pkgPath]);

      if ( descriptor && descriptor.hasOwnProperty("type") ) {
        let t = descriptor.type;
        let r = descriptor.register;

        plugins[t][descriptor.name] = this.handler.hasOwnProperty(t) ? r(this.handler[t]) : r;
      }
    });

    return type ? plugins[type] : plugins;
  },

  handler: {
    cdn: Uploader,
    command: Commander
  }
};
