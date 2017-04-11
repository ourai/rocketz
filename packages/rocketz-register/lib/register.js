"use strict";

const Plugie = require("plugie");

const handlers = {
    cdn: require("./uploader"),
    command: require("./commander")
  };

const register = new Plugie({
    name: "rocketz",
    types: Object.keys(handlers),
    handlers
  });

module.exports = register;
