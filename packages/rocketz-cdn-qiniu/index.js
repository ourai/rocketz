"use strict";

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const qiniu = require("qiniu");

var descriptor = {
    name: "qiniu",
    type: "cdn"
  };

function isFunc( obj ) {
  return typeof obj === "function";
}

descriptor.register = function( CDN ) {
  return class Qiniu extends CDN {
    constructor( settings ) {
      super(settings);

      qiniu.conf.ACCESS_KEY = this.ACCESS_KEY;
      qiniu.conf.SECRET_KEY = this.SECRET_KEY;

      // this.__token = (new qiniu.rs.PutPolicy(this.space)).token();
    }

    uploadFile( file ) {
      var cloud = this;
      var localFile = path.join(cloud.local, file);
      var key = path.join(cloud.remote, file);
      var extra = new qiniu.io.PutExtra();

      cloud.uploading++;

      qiniu.io.putFile(cloud.__token, key, localFile, extra, function( err, ret ) {
        var rl;

        cloud.uploaded++;

        if ( err ) {
          if ( err.code === 614 ) {
            if ( cloud.interactive ) {
              rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
              });

              rl.question("文件已经存在，是否仍要上传？[Y/n]", function( answer ) {
                if ( answer.toLowerCase() === "y" ) {
                  cloud.remove(key, function() {
                    cloud.uploadFile(file);
                  });
                }

                rl.close();
              });
            }
            else {
              console.log("!!! " + key + " 已经存在");
            }
          }
          else {
            cloud.failedFiles.push(file);

            console.log("上传到七牛时发生如下错误\n", err);
          }
        }
        else {
          log.uploaded(ret.key, "qiniu");
        }
      });
    }

    // 删除指定文件
    remove( keys, force, callback ) {
      var cloud = this;
      var cl = new qiniu.rs.Client();

      if ( typeof keys === "string" ) {
        keys = [keys];
      }

      if ( Array.isArray(keys) ) {
        if ( isFunc(force) ) {
          callback = force;
        }

        keys.forEach(function( key ) {
          cl.remove(cloud.space, key, function( err, ret ) {
            if ( err ) {
              console.log(err);
            }

            if ( isFunc(callback) ) {
              callback.apply(cloud, [err, ret]);
            }
          });
        });
      }
    }
  }
};


module.exports = descriptor;
