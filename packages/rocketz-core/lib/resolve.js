"use strict";

const path = require("path");
const fs = require("fs");

const findSync = require("find-up").sync;

const PLUGIN_TYPES = ["cdn"];
const MODULE_DIR = "node_modules";

var pkgs = {};

function findModules( dir ) {
  if ( !fs.existsSync(dir) || path.resolve(dir) === process.env.HOME ) {
    return;
  }

  fs
    .readdirSync(dir)
    .filter(function( dirname ) {
      return (new RegExp(`^rocketz-${PLUGIN_TYPES.join("|")}-`)).test(dirname) && !pkgs[dirname];
    })
    .forEach(function( plugin ) {
      pkgs[plugin] = path.resolve(dir, plugin);
    });
}

module.exports = function() {
  let localPath = findSync(MODULE_DIR, {cwd: __dirname});
  let globalPath = findSync(MODULE_DIR, {cwd: path.join(process.env._, "../../lib")});
  let rocketzName = require(findSync("package.json", {cwd: __dirname})).name;
  let pkgName = require(path.join(path.dirname(localPath), "package.json")).name;

  if ( pkgName === rocketzName ) {
    localPath = findSync(MODULE_DIR, {cwd: path.join(localPath, "../..")});
  }

  [localPath, globalPath].forEach(findModules);

  return pkgs;
};
