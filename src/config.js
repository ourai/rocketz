"use strict";

import fs from "fs";
import path from "path";
import readline from "readline";

const confDir = ".rocketz";

function isCloudValid( cloudType ) {
  return ["qiniu", "wantu"].indexOf(cloudType) > -1;
}

function getCloudPath( cloudType ) {
  return path.join(path.join(process.cwd(), confDir), cloudType + ".json");
}

function getCloudSetting( cloudType, ak, sk, spaceName ) {
  var cloudSetting = {};

  switch( cloudType ) {
    case "qiniu":
      cloudSetting = {
          access_key: ak,
          secret_key: sk,
          bucket: spaceName
        };
      break;
    case "wantu":
      cloudSetting = {
          access_key: ak,
          secret_key: sk,
          namespace: spaceName
        };
      break;
  }

  return cloudSetting;
}

function configCloud( cloudType ) {
  var cloudPath = getCloudPath(cloudType);
  var count = 0;
  var rl, ak, sk, spaceName;

  if ( !(fs.existsSync(confDir) && fs.statSync(confDir).isDirectory()) ) {
    fs.mkdirSync(confDir);
  }

  if ( fs.existsSync(cloudPath) ) {
    console.log("The setting of " + cloudType + " has already existed.");
  }
  else {
    console.log("\nPlease input the setting info of " + cloudType + ":")

    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

    rl.setPrompt("Access Key:");
    rl.prompt();

    rl
      .on("line", function( line ) {
        var text = line.trim();

        count++;

        switch(count) {
          case 1:
            ak = text;
            rl.setPrompt("Secret Key:");
            break;
          case 2:
            sk = text;
            rl.setPrompt("Space's name:");
            break;
          case 3:
            spaceName = text;
            rl.close();
            break;
        }

        if ( count !== 3 ) {
          rl.prompt();
        }
      })
      .on("close", function() {
        if ( ak && sk && spaceName ) {
          fs.writeFileSync(cloudPath, JSON.stringify(getCloudSetting(cloudType, ak, sk, spaceName)));

          console.log("\nSuccess!");
        }
        else {
          console.log("\nFailed!");
        }

        process.exit(0);
      });
  }
}

function setConfig( cloudType ) {
  if ( cloudType == null ) {
    console.log("Please input a CDN's code.");
  }
  else if ( isCloudValid(cloudType) ) {
    configCloud(cloudType);
  }
  else {
    console.log(cloudType + " is an unknown CDN code.");
  }
}

export default {
  setConfig,
  getConfig: function( cloudType ) {
    var cloudPath = getCloudPath(cloudType);
    var conf;

    if ( isCloudValid(cloudType) && fs.existsSync(cloudPath) ) {
      conf = JSON.parse(fs.readFileSync(cloudPath, "utf-8"));
    }

    return conf;
  }
}
