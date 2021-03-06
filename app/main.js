

(function () {
  "use strict";

  var paths, shim, lib;
  /**
   * Default Library folder path
   *
   * @type {string}
   */
  lib = "./lib/";


  shim = {
    "backbone": {
      deps: ["underscore", "jquery", "addon"],
      exports: "Backbone"
    },
    "addon": [],
    "underscore": {
      exports: "_"
    },
    "handlebars": {
      exports: "Handlebars"
    },
    "etb": {
      exports: "Ebook"
    },
    "hammer.event": {
      deps: ["jquery", "hammer"]
    },
    "hammer": {
      exports: "Hammer"
    },
    "iscroll": {
      exports: "iScroll"
    },
    "filer": {
      exports: "Filer"
    }
  };

  /**
   * Paths of Javascript Library
   */
  paths = {
    "jquery": lib + "jquery",
    "backbone": lib + "backbone",
    "underscore": lib + "underscore",
    "text": lib + "requirejs/text",
    "pkg": lib + "requirejs/pkg",
    "tpl": lib + "requirejs/tpl",
    "hammer": lib + "gesture/hammer",
    "hammer.event": lib + "gesture/hammer.event",
    "etb": lib + "etb",
    "doT": lib + "template/doT",
    "iscroll": lib + "gesture/iscroll",
    "addon": lib + "addon",
    "filer": lib + "filer",
  };

  /**
   * Configure requirejs.
   */
  requirejs.config({
    shim: shim,
    paths: paths,
    map: {
      "*": {
        "base": "plugins/base"
      }
    },
    packages: ["plugins/base"],
    config: {
      pkg: {
        path: "plugins"
      }
    }
  });

  var searchCover = location.search.replace("?", "");
  searchCover = searchCover.split("&");
  searchCover.forEach(function (item) {
    var itemArr = item.split("=");
    if (itemArr[0] === "cover") {
      document.getElementById("cover").src = itemArr[1];
    }
  });
  /////////////////// system  start ////////////////////////////////////

  requirejs(["pkg!core"], function (App) {

    var ReaderApp = new App();
    return ReaderApp;
  });

}());