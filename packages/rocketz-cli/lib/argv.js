"use strict";

var fs = require("fs");
var path = require("path");
var readline = require("readline");

var rocketz = require("rocketz-core");

var pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf-8"));

function invalidCmd() {
  console.log(pkg.name + " 不存在该指令！");
}

function initConfig() {
  var configFile = "rocketz-conf.json";
  var configPath = path.join(process.cwd(), configFile);
  var configMap = {};
  var count = 0;
  var rl;

  if ( fs.existsSync(configPath) ) {
    console.log("配置文件 " + configFile + " 已经存在！");
  }
  else {
    console.log("请根据提示输入配置项：\n");

    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.setPrompt("Local assets' path (relative path):");
    rl.prompt();

    rl
      .on("line", function( line ) {
        var text = line.trim();

        count++;

        switch(count) {
          case 1:
            configMap.assets = text;
            rl.setPrompt("Remote path (relative path):");
            break;
          case 2:
            configMap.remote = text;
            rl.setPrompt("Name of files to be uploaded (without extension, default is all):");
            break;
          case 3:
            configMap.files = text;
            rl.setPrompt("Extension of files to be uploaded (default is all):");
            break;
          case 4:
            configMap.exts = text;
            rl.setPrompt("Whether traverse deeply (default is true):");
            break;
          case 5:
            configMap.deep = text === "false" ? false : true;
            rl.setPrompt("Whether interactively (default is true):");
            break;
          case 6:
            configMap.interactive = text === "false" ? false : true;
            rl.close();
            break;
        }

        if ( count !== 6 ) {
          rl.prompt();
        }
      })
      .on("close", function() {
        var configMapStr = JSON.stringify(configMap);

        if ( count === 6 ) {
          fs.writeFileSync(configPath, configMapStr);

          console.log("\nSuccess!\nPlease review your config below:\n" + configMapStr);
        }
        else {
          console.log("\nFailed!");
        }
      });
  }
}

module.exports = function( args ) {
  var subCmd = args[0];

  if ( /^[a-z]+$/.test(subCmd) ) {
    switch(subCmd) {
      case "init":
        initConfig();
        break;
      default:
        invalidCmd();
    }
  }
  else if ( /^\-[a-z]$/.test(subCmd) ) {
    switch(subCmd.slice(1)) {
      case "v":
        console.log(pkg.name + " v" + pkg.version);
        break;
      default:
        invalidCmd();
    }
  }
  else if ( /^\-\-[a-z]{2,}$/.test(subCmd) ) {
    switch(subCmd.slice(2)) {
      case "config":
        rocketz.setCloud(args[1]);
        break;
      case "view":
        console.log(rocketz.getCloud(args[1]) || {});
        break;
      default:
        invalidCmd();
    }
  }
  else {
    invalidCmd();
  }
};
