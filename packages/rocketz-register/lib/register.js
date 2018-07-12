"use strict";

const Plugie = require("plugie");

const handlers = {
    cdn: require("./uploader"),
    command: require("./commander")
  };

const register = new Plugie({
    name: "rocketz",
    handlers
  });

module.exports = register;
