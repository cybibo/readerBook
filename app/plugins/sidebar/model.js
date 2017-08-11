define(function (require, exports, module) {
  var Plugin = require("pkg!pluginBase");
  var config = Plugin.config;

  var Model = Plugin.Model.extend({
    defaults: {
      width: 0,
      height: 0,
      left: 0,
      right: 0,
      activePage: 0
    },
    init: function () {
      this.set("outline", config.get("ebook").get("ncx").modules);
      this.set("pages", config.get("ebook").get("ncx").orders);
    }
  });
  return Model;
});
