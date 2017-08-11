define(function (require, exports, module) {
  var Plugin = require("pkg!pluginBase");
  var config = Plugin.config;
  var storage = require("pkg!storage");

  var Model = Plugin.Model.extend({
    defaults: {
      bookmarks: [],
      activePage: -1
    },
    init: function () {
      var toc = config.get("ebook").get("ncx");
      var length = _.size(toc.points);
      var bookmarks, fullPath;

      fullPath = config.get("ebook").get("fullPath") + "/" + config.get("ebook").get("opfRoot");
      this.set("length", length);
      this.set("toc", toc);
      this.set("fullPath", fullPath);

      storage.local.get(fullPath + "/bookmarks", function(ret) {
        bookmarks = ret[fullPath + "/bookmarks"];
      });
      if (bookmarks) {
        this.set("bookmarks", JSON.parse(bookmarks));
      }
    }
  });
  return Model;
});
