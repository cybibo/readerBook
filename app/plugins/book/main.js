define(function (require, exports, module) {
  var base = require("pkg!pluginBase");
  var config = require("pkg!config");
  var singlePage = require("./customSinglePage/view");
  var BookView = base.View.extend({
    el: "#book-stage",
    initialize: function () {
      this.BookView = new singlePage();
      this.emit("system:register.end", "init", "page:end.preload");
    },
    obEvents: {
      // "system:enter.mode": "modeChange",
      "book:zoom.in": "zoomIn",
      "book:zoom.out": "zoomOut",

      "sync:cmd.turn": "toPage",
      "sync:cmd.page.endable": "unlockPage",
      "sync:cmd.page.disable": "lockPage",

      "book:turn": "toPage",
      "book:turned": "removeAnimation",
      "book:end.preload": "endInit",
      "gesture:swipe":"swipe",
      "book:jump.with.id":"jumpById"
    },
    jumpById:function(pageId){
        var page = config.get("ebook").get("id2page")[pageId];

      // If doesn't find page number with page id, return ;
      if (!page) {
        return false;
      }

      // Emit book turn to reader.
      this.emitAsync("book:turn", page);
    },
    swipe:function(dir,evt){
      if (dir === "left"){

        this.emit("book:turn","next");
        return ;
      }

      if (dir === "right"){
  
        this.emit("book:turn","prev");
        return ;
      }

    },
    toPage: function (page, force) {
     
 
      /* zoom mode doesn"t  turn page */
      if (!force && this.$el.hasClass("zoom")) return;
     // this.$el.addClass("flip");
      this.BookView.toPage(page);
    },
    removeAnimation: function () {
     // this.$el.removeClass("flip");
    },
    unlockPage: function () {
      this.BookView.unlockPage();
    },
    lockPage: function () {
      this.BookView.lockPage();
    },
    zoomIn: function () {
      this.$el.addClass("zoom");
    },
    zoomOut: function () {
      this.$el.removeClass("zoom");
    },
    endInit: function (ebook) {
      this.BookView.endInit(ebook);
    }
  });

  return BookView;
});
