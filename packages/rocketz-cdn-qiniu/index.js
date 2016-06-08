"use strict";

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const qiniu = require("qiniu");

const descriptor = {
    name: "qiniu",
    type: "cdn"
  };

function isFunc( obj ) {
  return typeof obj === "function";
}

descriptor.register = function( CdnFactory ) {
  return class Qiniu extends CdnFactory {
    constructor( settings ) {
      super(settings);

      qiniu.conf.ACCESS_KEY = this.accessKey;
      qiniu.conf.SECRET_KEY = this.secretKey;

      this.__token = (new qiniu.rs.PutPolicy(this.space)).token();
    }

    uploadFile( file ) {
      let localFile = path.join(this.local, file);
      let key = path.join(this.remote, file);
      let extra = new qiniu.io.PutExtra();

      this.uploading++;

      qiniu.io.putFile(this.__token, key, localFile, extra, ( err, ret ) => {
        this.uploaded++;

        if ( err ) {
          this.failedFiles.push(file);
          this.emit("upload:fail", this, ret, err);
        }
        else {
          this.emit("upload:success", this, ret);
        }
      });
    }

    // 删除指定文件
    remove( keys, force, callback ) {
      if ( typeof keys === "string" ) {
        keys = [keys];
      }

      if ( Array.isArray(keys) ) {
        let cl = new qiniu.rs.Client();

        if ( isFunc(force) ) {
          callback = force;
        }

        keys.forEach(( key ) => {
          cl.remove(this.space, key, ( err, ret ) => {
            if ( err ) {
              this.emit("remove:fail", this, ret, err);
            }

            if ( isFunc(callback) ) {
              callback.apply(this, [err, ret]);
            }
          });
        });
      }
    }
  }
};

module.exports = descriptor;
