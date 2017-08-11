define(function(require, exports, module) {
  "use strict";
  // 获取相关依赖

  //plugin relative
  var PluginBase = require("pkg!pluginBase");

  // system relative
  var ReaderModel = require("./readerModel");

  var systemMode = require("pkg!systemMode");
  var Book = require("pkg!book");
  var Toc = require("pkg!toc");
  var Toolbar = require("pkg!toolbar");
  var Annotation = require("pkg!toolAnnotation");
  var Sidebar = require("pkg!sidebar");
  var BookParse = require("pkg!bookParse");

  //jquery 
  require("hammer.event");

  // Fix some aciton for book
  require("./action.fix");

  /**
   * Reader 类
   */
  var Reader = PluginBase.View.extend({
    el: "#reader-stage",
    initialize: function() {
      var config, plugins;

      this.model = new ReaderModel({});

      // 初始化主题
      //this.initTheme();

      config = this.model.get("config");


      // initilize systemMode to reader;
      systemMode.enter("reader");
      this.bookView = new Book();
      this.tocView = new Toc();
      this.toolbarView = new Toolbar();
      this.annotationView = new Annotation();
      this.sidebarView = new Sidebar();
      this.bookData = new BookParse();
      this.emitAsync("plugin:end.init"); 
    },

    obEvents: {
      "book:end.init": "hideStartup",
      "book:show.sidebar": "showBookmask"
    },
    events: {
      "swipe #book-stage": "swipeEvent",
      "click #book-mask": "hideSidebar",
      "swipe #book-mask-toc": "hideToc"
    },
    swipeEvent: function(evt) {
      // if (evt.target.id !== this.el.id) return;

      this.emit("gesture:swipe", evt.originalEvent.gesture.direction, evt);
      var dir = evt.originalEvent.gesture.direction;

      if (dir === "up" && !systemMode.is("toolbar")) {

        systemMode.enter("toc", "reader");
        this.$el.find("#book-mask-toc").addClass("active");
        evt.preventDefault();
        return false;
      }

      if (dir === "down" && systemMode.is("toc")) {

        systemMode.exit("toc");
        evt.preventDefault();
        return false;
      }

      if (dir === "up" && systemMode.is("toolbar")) {
        systemMode.exit("toolbar");
        evt.preventDefault();
        return false;
      }

      if (dir === "down" && !systemMode.is("toc")) {
        systemMode.enter("toolbar", "reader");
        evt.preventDefault();
        return false;

      }

    },
    hideToc: function(evt) {
      var dir = evt.originalEvent.gesture.direction;
      if (dir === "down" && systemMode.is("toc")) {
        systemMode.exit("toc");
        this.$el.find("#book-mask-toc").removeClass("active");
        evt.preventDefault();
        return false;
      }
    },
    hideSidebar: function(evt) {
      this.$el.find("#book-mask").removeClass("active");
      this.emit("book:hide.sidebar");
    },
    showBookmask: function() {
      this.$el.find("#book-mask").addClass("active");
    },
    hideStartup: function() {
      var $leftpages = $('#book .left-page');

      var config = this.model.get('config');
      if ($leftpages.length < config.get('start')) {
        config.set('start', 1);
      }

      $("#startup .left-page").html($leftpages.eq(config.get('start') - 1).html());

      var initEnd = function() {
        $("body").addClass("init-end");
        setTimeout(openCover, 1000);
      }.bind(this);

      var openCover = function() {

        $("body").removeClass("init-end init");
        setTimeout(function() {
          $("#startup").remove();
          this.emitAsync("book:open.cover", "open");
        }.bind(this), 20);

      }.bind(this);

      setZeroTimeout(initEnd);
    }
  });



  return Reader;
});