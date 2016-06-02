"use strict";

var _ = require("lodash");

var DEFAULTS = {
    uploading: 0,
    uploaded: 0,
    waiting: false
  };

/**
 * 上传文件
 *
 * @param files
 * @param completed
 * @private
 */
function upload( files, cloud, completed ) {
  cloud.waiting = true;

  files.forEach(function( file ) {
    cloud.uploadFile(file);
  });

  cloud.timer = setInterval(function() {
    if ( !(cloud.uploading === cloud.uploaded && cloud.uploaded === files.length) ) {
      return;
    }

    cloud.__reset();

    if ( _.isFunction(completed) ) {
      completed(cloud);
    }
  }, 200);
}

/**
 * 直接上传文件
 *
 * @param cloud
 */
function send( cloud ) {
  upload(cloud.files, cloud, retry);
}

/**
 * 分组上传的文件
 *
 * @param cloud
 */
function sendChunked( cloud ) {
  if ( cloud.chunkedFiles.length === 0 ) {
    retry(cloud);
  }
  else {
    upload(cloud.chunkedFiles.shift(), cloud, function( cloud ) {
      sendChunked(cloud);
    });
  }
}

/**
 * 重新上传失败的文件
 *
 * @param cloud
 */
function retry( cloud ) {
  var files = cloud.failedFiles;

  if ( files.length === 0 ) {
    return;
  }

  console.log("\n[WARN] 以下 " + files.length + " 个文件上传失败\n" + files.join("\n"));

  if ( cloud.retryCount > 0 ) {
    console.log("\n[INFO] 将要重新上传以上文件");

    cloud.failedFiles = [];
    cloud.retryCount--;

    upload(files, cloud, retry);
  }
}

function Cloud() {}

Cloud.prototype = _.assign(DEFAULTS, {
  // fragment: 1,
  // retryCount: 0,
  files: [],
  failedFiles: [],
  /**
   * 重置状态
   *
   * @private
   */
  __reset: function() {
    if (this.timer !== undefined) {
      clearInterval(this.timer);
      delete this.timer;
    }

    return _.assign(this, DEFAULTS);
  },
  /**
   * 碎片化资源文件
   * 将大批量文件切割
   */
  chunk: function() {
    var f = this.fragment;

    if (!(_.isNumber(f) && f > 1)) {
      return false;
    }

    return this.chunkedFiles = _.chunk(this.files, f);
  },
  // /**
  //  * 上传单个文件的处理逻辑
  //  */
  // uploadFile: function() {},
  /**
   * 上传文件
   */
  upload: function() {
    if ( _.isString(this.files) ) {
      this.files = [this.files];
    }

    if ( !_.isArray(this.files) ) {
      return false;
    }

    if ( _.isArray(this.chunkedFiles) ) {
      sendChunked(this);
    }
    else {
      send(this);
    }
  },
  /**
   * 删除文件
   */
  remove: function() {}
});

module.exports = Cloud;
