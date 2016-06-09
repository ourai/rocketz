"use strict";

const path = require("path");

const Sdk = require("wantu");

const descriptor = {
  name: "wantu",
  type: "cdn"
};

descriptor.register = function( CdnFactory ) {
  return class Wantu extends CdnFactory {
    constructor( settings ) {
      super(settings);

      this.__inst = new Sdk(settings.accessKey, settings.secretKey);
      this.__ns = settings.space;
    }

    uploadFile( file ) {
      let dir = path.join(this.remote, path.dirname(file));

      if ( dir === "." ) {
        dir = "";
      }

      this.uploading++;

      this.__inst.singleUpload({
        namespace: this.__ns,
        expiration: -1
      }, path.join(this.local, file), ("/" + dir), "", "", ( err, res ) => {
        this.uploaded++;

        if ( !err && res.statusCode === 200 ) {
          this.emit("upload:success", this, res);
        }
        else {
          this.failedFiles.push(file);
          this.emit("upload:fail", this, res, err);
        }
      });
    }
  }
};

module.exports = descriptor;
