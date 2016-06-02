"use strict";

var fs = require("fs");
var path = require("path");

var WantuSDK = require("wantu");
var _ = require("lodash");

var util = require("./util");
var log = require("./log");

var Wantu = util.extendsClass(function Wantu( settings ) {
  _.assign(this, settings);

  this.__inst = new WantuSDK(settings.ACCESS_KEY, settings.SECRET_KEY);
  this.__ns = settings.space;

  this.chunk();
}, require("./cloud"));

Wantu.prototype.uploadFile = function( file ) {
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
};

module.exports = Wantu;
