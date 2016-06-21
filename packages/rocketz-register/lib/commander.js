"use strict";

const inquirer = require("inquirer");

const Configurator = require("./configurator");

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

  getConfigurator( ...args ) {
    return new Configurator(...args);
  }
}

module.exports = Commander;
