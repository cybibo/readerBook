define(function (require, exports, module) {

  var PluginBase = require("pkg!pluginBase");
  var template = require("tpl!./toolbar");
  var systemMode = require("pkg!systemMode");
  var ToolbarModel = require("./model");
  var storage = require("pkg!storage");

  var View = PluginBase.View.extend({
    id: "toolbar",
    mode: "toolbar",
    template: template,
    initialize: function () {
      this.model = new ToolbarModel({});
      // this.render();
      this.emit("system:register.end", "init", "toolbar:end.init");
    },
    init: function() {
      this.model.init();
      this.emitAsync("toolbar:end.init");
    },
    events: {
      "click .bookmark,.dict,.search": "callTool",
      "click .annotation": "toolAnnotation",
      "click .sidebar-menu": "showSidebar",
      "click .bookmark-dialog .action .ok": "addBookmark",
      "click .bookmark-dialog .action .delete": "removeBookmark"
    },
    obEvents: {
      "book:open.cover": "render",
      "system:change.mode": "modeChange",
      "gesture:swipe": "swipe",
      "book:end.preload": "init",
      "book:turned": "setActivePage"
    },
    toolAnnotation: function() {
    	$("#toolAnnotation").toggleClass("active");
    	
    },
    showSidebar: function() {
      this.emit("book:show.sidebar");
    },
    callTool: function (evt) {
      var data = evt.currentTarget.dataset.value;
      var $bookmarkDialog = this.$el.find(".bookmark-dialog");
			if (data === "bookmark") {
				//systemMode.enter("toolBookmark");
				if ($bookmarkDialog.hasClass("show")) {
					$bookmarkDialog.removeClass("show");
				} else {
					this.showBookmark();
				}
			}

      //end
      this.emit("system:call.tool", data);
    },
    showBookmark: function() {
      var activePage, bookmarks, bookmarkItem, bookmarkTitle, $bookmarkTitleInput, $bookmarkDialog;

      activePage = this.model.get("activePage");
      bookmarks = this.model.get("bookmarks");
      bookmarkItem = _.find(bookmarks, function(bm) { return bm.pageNumber === activePage; });
      $bookmarkTitleInput = this.$el.find(".bookmark-dialog .title input");
      $bookmarkDialog = this.$el.find(".bookmark-dialog");
      if (bookmarkItem) {
        bookmarkTitle = bookmarkItem.title;
        this.$el.find(".bookmark-dialog > .action > .delete").show();
      } else {
        bookmarkTitle = this.getPageByPageNumber(this.model.get("activePage")).label;
        this.$el.find(".bookmark-dialog > .action > .delete").hide();
      }
      $bookmarkTitleInput.val(bookmarkTitle);
      $bookmarkDialog.addClass("show");
    },
    addBookmark: function(evt) {
      var activePage, bookmark, $bookmarkTitleInput;
      activePage = this.model.get("activePage");
      $bookmarkTitleInput = this.$el.find(".bookmark-dialog .title input");
      bookmark = {
        pageNumber: activePage,
        title: $bookmarkTitleInput.val()
      };
      this.saveBookmark(bookmark);
      this.emit("book:change.bookmark", this.model.get("bookmarks"));
      this.$el.find(".bookmark").addClass("marked");
      this.$el.find(".bookmark-dialog").removeClass("show");
    },
    removeBookmark: function(evt) {
      var index, item, activePage, bookmarks, storageObj;
      activePage = this.model.get("activePage");
      bookmarks = this.model.get("bookmarks");
      item = _.find(bookmarks, function(bm) { return bm.pageNumber === activePage; });
      index = bookmarks.indexOf(item);

      if (index !== -1) {      
        bookmarks.splice(index, 1);
        storageObj = {};
        storageObj[this.model.get("fullPath") + "/bookmarks"] = bookmarks;
        storage.local.set(storageObj);
        this.emit("book:change.bookmark", bookmarks);
      }
      this.$el.find(".bookmark").removeClass("marked");
      this.$el.find(".bookmark-dialog").removeClass("show");
    },
    saveBookmark: function(bookmark) {
      var storageObj = {};
      var bookmarks = this.model.get("bookmarks");
      var bookmarkItem = _.find(bookmarks, function(bm) { return bm.pageNumber === bookmark.pageNumber; });
      if (bookmarkItem) {
        if (bookmarkItem.title !== bookmark.title) {
          bookmarkItem.title = bookmark.title;
        }
      } else {
        bookmarks.push(bookmark);
      }
      storageObj[this.model.get("fullPath") + "/bookmarks"] = bookmarks;
      storage.local.set(storageObj);
    },
    close: function () {
      if (!window.close) return;

      if (window.parent) {
        window.parent.opener = null;
        window.parent.close();
        return;
      }

      window.close();

    },
    swipe:function(dir,evt){      
      
    },
    modeChange: function (oldMode, newMode) {
      
      if (newMode != this.mode && oldMode != this.mode) return;

      if (newMode === this.mode) return this.show();

      if (oldMode === this.mode) return this.hide();
    },
    show: function () {

      this.$el.addClass("active");
      this.emit("book:disable.action");
    },
    hide: function () {
      this.$el.removeClass("active");
      this.emit("book:enable.action");
    },
    render: function () {
      this.$el.html(this.template()).appendTo($("body"));
    },
    getPageByPageNumber: function(number) {
      var toc = this.model.get("toc");
      if (isNaN(number) || number < 1 || number > toc.orders.length) {
        return null;
      }
      var pageId = toc.orders[number - 1];
      return toc.points[pageId];
    },
    setActivePage: function(pageNumber) {
      var activePage = this.model.get("activePage");
      var length = this.model.get("toc").orders.length;

      if (pageNumber == "prev") {
        activePage = (activePage - 1) <= 1 ? 1 : activePage - 1;
      } else if (pageNumber == "next") {
        activePage = (activePage + 1) >= length ? length : activePage + 1;
      } else if (_.isNumber(pageNumber) && pageNumber >= 1 && pageNumber <= length) {
        activePage = pageNumber;
      }

      this.model.set("activePage", activePage);

      var bookmarks = this.model.get("bookmarks");
      var isMarked = !!_.find(bookmarks, function(bookmark) { return bookmark.pageNumber === pageNumber; });
      var bookmarkIcon = this.$el.find(".bookmark");
      if (isMarked) {
        bookmarkIcon.addClass("marked");
      } else {
        bookmarkIcon.removeClass("marked");
      }
    }

  });
  return View;
});
