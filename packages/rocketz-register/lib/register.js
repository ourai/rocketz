"use strict";

const path = require("path");
const fs = require("fs");

const findSync = require("find-up").sync;

const Uploader = require("./uploader");

const PLUGIN_TYPES = ["cdn", "command"];
const PACKAGE_DIR = "node_modules";

const libName = require(findSync("package.json", {cwd: __dirname})).name.split("-").shift();
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
      return (new RegExp(`^${libName}-${PLUGIN_TYPES.join("|")}-`)).test(dirname) && !pkgs[dirname];
    })
    .forEach(function( plugin ) {
      pkgs[plugin] = path.resolve(dir, plugin);
    });
}

/**
 * 收集插件
 */
function collectPackages() {
  let localPath = findSync(PACKAGE_DIR, {cwd: __dirname});

  if ( require(path.join(path.dirname(localPath), "package.json")).name === libName ) {
    localPath = findSync(PACKAGE_DIR, {cwd: path.join(localPath, "../..")});
  }

  [localPath, findSync(PACKAGE_DIR, {cwd: path.join(process.env._, "../../lib")})].forEach(findPackages);
}

module.exports = {
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

    collectPackages();

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
    cdn: Uploader
  }
};
