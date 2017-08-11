define(function (require, exports, module) {
  "use strict";
  var PluginBase, SidebarModel, tpl, bookmarkTpl, iScroll, View, _, systemMode;

  PluginBase = require("pkg!pluginBase");

  SidebarModel = require("./model");

  tpl = require("tpl!./sidebar");

  bookmarkTpl = require("tpl!./bookmark");

  iScroll = require("iscroll");

  _ = require("underscore");

  systemMode = require("pkg!systemMode");

  View = PluginBase.View.extend({
    itemWidth: 0,
    id: "sidebar",
    mode: "sidebar",
    initialize: function () {
      this.model = new SidebarModel({});
      this.$el.appendTo($("#reader-stage"));
      this.emit("system:register.end", "init", "sidebar:end.init");
    },
    init: function () {
      this.model.init();
      this.emitAsync("sidebar:end.init");
    },
    events: {
      "click .outline-page": "toPage",
      "click .folder .btn": "folderList",
      "click .outline .folder": "highlightClicked",
      "click .bookmark li": "toBookmark",
      "swipe": "swipe"
    },
    obEvents: {
      "book:turned": "activatePage",
      "system:change.mode": "modeChange",
      "book:end.preload": "init",
      "book:show.sidebar": "show",
      "book:hide.sidebar": "hide",
      "book:change.bookmark": "renderBookmark"
    },
    modelEvents: {
      "change:outline": "render"
    },

    swipe:function(evt){
      this.iScroll.scrollTo(0, evt.originalEvent.gesture.deltaY, 200, true);
      evt.stopPropagation();
    },
    folderList: function(evt) {
      var folder = evt.currentTarget.parentElement;
      var list = folder.nextElementSibling;
      if (folder.classList.contains("folded")) {
        folder.classList.remove("folded");
      } else {
        folder.classList.add("folded");
      }
      if (list.classList.contains("folded")) {
        list.classList.remove("folded");
      } else {
        list.classList.add("folded");
      }
    },
    highlightClicked: function(evt) {
      this.$el.find(".outline .current").removeClass("current");
      evt.currentTarget.classList.add("current");
    },
    modeChange: function (oldMode, newMode) {
      if (newMode !== this.mode && oldMode !== this.mode) {return ;}

      if (newMode === this.mode) {return this.show();}

      if (oldMode === this.mode)  {return this.hide();}

    },
    toggle: function () {
      if (this.el.classList.add("active")) {return this.hide();}
      return this.show();
    },
    show: function () {
      this.el.classList.add("active");
    },
    hide: function () {
      this.el.classList.remove("active");
    },
    toBookmark: function(evt) {
      var pageNumber = evt.currentTarget.dataset.pagenumber;
      // this.activatePage(pageNumber, 250);
      this.emitAsync("book:turn", pageNumber, true);
    },
    toPage: function (evt) {
      var pageID = evt.currentTarget.dataset.page;
      var pageNumber = this.model.get("pages").indexOf(pageID) + 1
      this.activatePage(pageNumber, 250);
      this.emitAsync("book:turn", pageNumber, true);
    },
    activatePage: function (page, scrollTimeOut) {
      var activePage, length, $page, pageList, unitList, moduleList;
      if (!page) { return; }
      activePage = this.model.get("activePage");
      if (page === activePage && this.$pages.eq(activePage - 1).hasClass("current")) { return; }

      length = this.model.get("pages").length;
      if (page == "prev") {
        activePage = activePage && (activePage - 1) <= 1 ? 1 : activePage - 1;
      } else if (page == "next") {
        activePage = activePage && (activePage + 1) >= length ? length : activePage + 1;
      } else if (_.isNumber(page) && page >= 1 && page <= length) {
        activePage = page;
      }

      $page = this.$pages.eq(activePage - 1);
      this.model.set("activePage", activePage);
      this.$el.find(".outline .current").removeClass("current");
      $page.addClass("current");
      pageList = $page[0].parentElement;
      unitList = pageList.parentElement.parentElement;
      moduleList = unitList.parentElement.parentElement;
      if (pageList.classList.contains("folded")) {
        pageList.classList.remove("folded");
      }
      if (unitList.classList.contains("folded")) {
        unitList.classList.remove("folded");
      }
      if (moduleList.classList.contains("folded")) {
        moduleList.classList.remove("folded");
      }
      if (!scrollTimeOut) scrollTimeOut = 0;
      this.iScroll.scrollToElement(this.$el.find(".current")[0], scrollTimeOut, true);
    },
    render: function () {
      var outline = this.model.get("outline");
      var modules = [], units, i, j;
      for (i in outline) {
        if (!outline.hasOwnProperty(i)) continue;
        units = [];
        for (j in outline[i]) {
          if (!outline[i].hasOwnProperty(j)) continue;
          units.push(outline[i][j]);
        }
        modules.push(units);
      }
      var html = tpl(modules);
      this.$el.html(html);

      this.$pages = this.$el.find(".outline-page");
      this.iScroll = new iScroll("sidebar-scroll-wrapper", {vScrollbar: false});
    },
    renderBookmark: function(bookmarks) {
      var html = bookmarkTpl(bookmarks);
      var $bookmark = this.$el.find(".bookmark");
      $bookmark.html(html);
      this.iScroll.refresh();
    }

  });
  return View;
});
