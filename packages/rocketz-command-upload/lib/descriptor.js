"use strict";

const descriptor = {
  name: "upload",
  "type": "command"
};

descriptor.register = function ( argv, flags ) {
  cosnole.log(argv, flags);
};

module.exports = descriptor;
