"use strict";

var path = require("path");

var sysPrint = console.log;
var cloudMap = {
    qiniu: "七牛",
    wantu: "顽兔"
  };

var log = module.exports = {};

log.empty = function() {
  sysPrint("\n没有可上传的文件...");
};

log.files = function( files, dir ) {
  sysPrint("\n可以上传的文件如下：");

  files.forEach(function( f ) {
    sysPrint(path.join(dir, f), "\r");
  });
};

log.prepared = function( cloudType ) {
  sysPrint("\n将要上传到" + cloudMap[cloudType]);
};

log.abort = function() {
  sysPrint("\n放弃上传");
};

log.uploading = function( localFile, cloudType ) {
  sysPrint("[INFO] 正在上传到" + cloudMap[cloudType] + " >>> " + localFile + "\r");
};

log.uploaded = function( fileUrl, cloudType ) {
  sysPrint("[INFO] 文件已上传到" + cloudMap[cloudType] + " >>> " + fileUrl + "\r");
};
