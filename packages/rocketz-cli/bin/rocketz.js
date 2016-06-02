#!/usr/bin/env node

"use strict";

var fs = require("fs");
var path = require("path");

var cwd = process.cwd();

var rocketz = require("../index");
var argvParser = require("../lib/argv");

function exec( args ) {
  var configFile = "rocketz-conf.json";
  var configPath = path.join(cwd, configFile);

  if ( args.length > 0 ) {
    argvParser(args);
  }
  else {
    if ( fs.existsSync(configPath) ) {
      try {
        var configData = JSON.parse(fs.readFileSync(configPath, "utf-8"));

        if ( Object.prototype.toString.call(configData) === "[object Object]" ) {
          rocketz.init(configData);
          
          if ( rocketz.preview() ) {
            rocketz.run();
          }
        }
        else {
          console.log("配置文件 " + configFile + " 的内容不合法！");
        }
      }
      catch(e) {
        console.log(e);
      }
    }
    else {
      console.log("没找到配置文件 " + configFile);
    }
  }
}

exec(process.argv.slice(2));
