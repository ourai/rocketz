"use strict";

const path = require("path");

const sysPrint = console.log;
const cloudMap = {
    qiniu: "七牛",
    wantu: "顽兔"
  };

module.exports = {
  empty: function() {
  sysPrint("\n没有可上传的文件...");
  },
  files: function( files, dir ) {
    sysPrint("\n可以上传的文件如下：");

    files.forEach(function( f ) {
      sysPrint(path.join(dir, f), "\r");
    });
  },
  prepared: function( cloudType ) {
    sysPrint("\n将要上传到" + cloudMap[cloudType]);
  },
  abort: function() {
    sysPrint("\n放弃上传");
  },
  uploading: function( localFile, cloudType ) {
    sysPrint("[INFO] 正在上传到" + cloudMap[cloudType] + " >>> " + localFile + "\r");
  },
  uploaded: function( fileUrl, cloudType ) {
    sysPrint("[INFO] 文件已上传到" + cloudMap[cloudType] + " >>> " + fileUrl + "\r");
  }
};
