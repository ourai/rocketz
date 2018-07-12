"use strict";

const RocketZ = require("rocketz-core");

const descriptor = {
  name: "upload",
  type: "command",
  description: "Distribute assets to CDNs"
};

function getCdnSettings( cdns, cdnSpecific ) {
  return cdns.map(function( cdn ) {
    return {
      name: cdn,
      settings: cdnSpecific[cdn]
    }
  });
}

function normalize( cdnSpecific, flags ) {
  let settings = [];
  let flagCdns = flags.cdn;

  if ( flags.hasOwnProperty("cdn") && typeof flagCdns !== "string" ) {
    return settings;
  }

  let cdns = Object.keys(cdnSpecific);

  if ( flagCdns === "" ) {
    settings = getCdnSettings(cdns, cdnSpecific);
  }
  else {
    flagCdns = flags.cdn.split(",");
    settings = getCdnSettings(cdns.filter(function( cdn ) {
        return flagCdns.includes(cdn);
      }), cdnSpecific);
  }

  return settings;
}

descriptor.register = function ( CommandFactory ) {
  return function( argv, flags, conf ) {
    let cdnSpecific;

    console.log(conf);

    if ( conf.hasOwnProperty("cdn") ) {
      cdnSpecific = conf.cdn;
      delete conf.cdn;
    }

    if ( typeof cdnSpecific !== "object" ) {
      return false;
    }

    let cdnSettings = normalize(cdnSpecific, flags);

    if ( cdnSettings.length === 0 ) {
      return false;
    }

    let rocketz = new RocketZ(conf);

    rocketz.init(cdnSettings);

    console.log(argv, flags, conf);
  }
};

module.exports = descriptor;
