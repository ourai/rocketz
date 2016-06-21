"use strict";

const inquirer = require("inquirer");

class Commander {
  static info( ...args ) {
    return console.log(...args);
  }

  static warn( ...args ) {
    return console.warn(...args);
  }

  static error( ...args ) {
    return console.error(...args);
  }

  static prompt( ...args ) {
    return inquirer.prompt(...args);
  }

  constructor() {
  }
}

Commander.Configurator = require("./configurator");

module.exports = Commander;
