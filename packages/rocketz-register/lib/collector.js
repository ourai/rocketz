"use strict";

const fs = require("fs");
const path = require("path");

// 默认支持的文件类型（扩展名）
const defaultExts = [
    // 常见图片
    "jpg", "jpeg", "png", "gif", "svg",
    // 网络字体
    "eot", "ttf", "woff", "woff2",
    // 前端资源
    "css", "js", "swf"
  ];

const collector = module.exports = {};

/**
 * 判断是否为支持的文件类型
 *
 * @param fileName
 * @param includedFiles
 * @param includedExts
 * @returns {boolean}
 */
function isValidFile( fileName, includedFiles, includedExts ) {
  let exts = includedExts.length > 0 ? includedExts : defaultExts;
  let extName = path.extname(fileName);
  let valid = exts.includes(extName.slice(1));

  if ( valid && includedFiles.length > 0 ) {
    valid = includedFiles.includes(path.basename(fileName, extName));
  }

  return valid;
}

/**
 * 查找收集需要上传的文件
 *
 * @param localPath
 * @param includedFiles
 * @param includedExts
 * @param isDeep
 * @returns {Array}
 */
function collectFiles( localPath, includedFiles, includedExts, isDeep ) {
  let files = [];

  if ( typeof localPath === "string" && fs.existsSync(localPath) && fs.statSync(localPath).isDirectory() ) {
    fs.readdirSync(localPath).forEach(function( f ) {
      let p;
      let s;

      if ( f.charAt(0) !== "." ) {
        p = path.resolve(localPath, f);
        s = fs.statSync(p);

        if ( s.isDirectory() && isDeep ) {
          files = files.concat(collectFiles(p, includedFiles, includedExts, isDeep));
        }
        else if ( s.isFile() && isValidFile(f, includedFiles, includedExts) ) {
          files.push(p);
        }
      }
    });
  }

  return files;
}

collector.collect = collectFiles;
