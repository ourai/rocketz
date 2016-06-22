"use strict";

const fs = require("fs");
const path = require("path");

const _ = require("lodash");

const descriptor = {
  name: "init",
  type: "command",
  description: "Initialize settings"
};

function transform( items, conf ) {
  return items.map(function( item ) {
    let defaultValue = "";

    if ( _.has(conf, item.name) ) {
      defaultValue = conf[item.name];
    }
    else if ( _.isArray(item.default) ) {
      defaultValue = item.default.length === 0 ? "" : item.default.join(",");
    }

    return {
      name: item.name,
      message: `${item.description}：`,
      default: defaultValue,
      type: "input"
    }
  })
}

function normalize( common, cdnSpecific, savedConf, cdnConf ) {
  let items = _.concat(common);

  if ( !_.has(cdnConf, "cdn") ) {
    items = _.concat(cdnSpecific, items);
  }

  return transform(items, _.assign({}, savedConf, cdnConf));
}

descriptor.register = function ( Commander ) {
  return function( argv, flags, env ) {
    let Configurator = Commander.Configurator;
    let configurator = new Configurator(env);
    let cdnName = argv[0];

    Commander
      .prompt(normalize(...Configurator.group().concat(configurator.get(), configurator.get(cdnName))))
      .then(function( answers ) {
        configurator.merge(Object.getPrototypeOf(Configurator).normalize(answers, configurator.__defaults), cdnName);
        fs.writeFileSync(configurator.path(), JSON.stringify(configurator.get(), null, 2));
      });
  }
};

module.exports = descriptor;
