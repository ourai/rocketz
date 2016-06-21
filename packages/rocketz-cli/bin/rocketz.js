#!/usr/bin/env node

"use strict";

const fs = require("fs");

const Liftoff = require("liftoff");
const meow = require("meow");

const register = require("rocketz-register");

register.cwd(__dirname);

const APP_NAME = "rocketz";
const VALID_COMMAND = register.load("command");

const helper = meow({}, {
  alias: {
    h: "help",
    v: "version"
  }
});
const launcher = new Liftoff({
  name: APP_NAME,
  configName: `.${APP_NAME}`,
  extensions: {
    "rc": null
  }
});

const cliArgs = helper.input;
const cliFlags = helper.flags;

launcher.launch({
    cwd: cliFlags.cwd,
    configPath: cliFlags.config
  }, function( env ) {
  let cmd = cliArgs[0];

  if ( Object.keys(VALID_COMMAND).includes(cmd) ) {
    VALID_COMMAND[cmd](cliArgs.slice(1), cliFlags, env);
  }
  else {
    helper.showHelp();
  }
});
