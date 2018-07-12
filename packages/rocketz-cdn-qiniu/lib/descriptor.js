"use strict";

const path = require("path");

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

    normalizeResponse( target ) {
      let key = target.key;
      let domain = this.domain;

      return {
          url: key ? (domain ? decodeURIComponent(qiniu.rs.makeBaseUrl(domain, key)) : `/${key}`) : ""
        };
    }

    normalizeError( target ) {
      return {
          code: target.code,
          message: target.error
        };
    }

    uploadFile( file ) {
      let localFile = path.join(this.local, file);
      let key = path.join(this.remote, file);
      let extra = new qiniu.io.PutExtra();

      this.uploading++;

      qiniu.io.putFile(this.__token, key, localFile, extra, ( err, ret ) => {
        let res = this.normalizeResponse(ret);

        this.uploaded++;

        if ( err ) {
          this.failedFiles.push(file);
          this.emit("upload:fail", this.normalizeError(err), this, res);
        }
        else {
          this.emit("upload:success", res, this);
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
