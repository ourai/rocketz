"use strict";

const fs = require("fs");
const path = require("path");

const WantuSDK = require("wantu");
const _ = require("lodash");

const log = require("./log");
const Cloud = require("./cloud");

module.exports = class Wantu extends Cloud {
  constructor( settings ) {
    super(settings);

    this.__inst = new WantuSDK(settings.ACCESS_KEY, settings.SECRET_KEY);
    this.__ns = settings.space;
  }

  uploadFile( file ) {
    var cloud = this;
    var dir = path.join(cloud.remote, path.dirname(file));

    if ( dir === "." ) {
      dir = "";
    }

    cloud.uploading++;

    cloud.__inst.singleUpload({
      namespace: cloud.__ns,
      expiration: -1
    }, path.join(cloud.local, file), ("/" + dir), "", "", function( err, res ) {
      cloud.uploaded++;

      if ( !err && res.statusCode === 200 ) {
        log.uploaded(JSON.parse(res.data).url, "wantu");
      }
      else {
        cloud.failedFiles.push(file);

        console.log("上传到顽兔时发生如下错误\n", err.code);
      }
    });
  }
}
