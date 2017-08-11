/**
 * Reader Book Flip plugin
 * @author Wei.Ge<weix.ge@intel.com>
 * @version 0.1.0
 *
 */
define(function(require, exports, module) {

  'use strict';
  var BookSlide = function(options, element) {

    this.$el = $(element);
    this._init(options);

  };

  var startFlip;

  BookSlide.defaults = {
    speed: 1000000,
    item: ".page",
    activePage: 1,
    onend: function(old, page, isLimit) {
      return false;
    },
    onstart: function(page) {
      return false;
    }
  };

  BookSlide.prototype = {
    /**
     * Initialize book class.
     *
     * @param options
     * @private
     */
    _init: function(options) {

      // merge user custom options and defaults object.
      this.options = $.extend(true, {}, BookSlide.defaults, options);

      // change animation speed with stylesheet.
      var speed = this.options.speed;

      if (speed !== undefined && BookSlide.defaults.speed !== this.options.speed) {
        var style = document.createElement("style");
        document.head.appendChild(style);
        style.appendChild(document.createTextNode(''));
        style.sheet.insertRule(this.options.item + ".animation-prev,"+this.options.item + ".animation-next"+" {-webkit-animation-duration:" + this.options.speed + "ms;}", 0);
        console.log("animation speed: "+this.options.speed+"ms");
      }

      // set the perspective
      // this.$el.css('perspective', this.options.perspective);
      // items
      this.$items = this.$el.children(this.options.item);
      // total items
      this.itemsCount = this.$items.length;
      // current item's index
      this.activePage = this.options.activePage;
      // previous item's index
      this.prevPage = this.activePage - 1;

      // show first item
      for(var i = 0; i < this.activePage - 1; i++) {
        this.$items.eq(i).addClass("turned");
      }
      this.$items.eq(this.activePage - 1).addClass("active");

      this.transEndEventName = 'webkitAnimationEnd.bookblock';

    },
    /**
     * Do book page flip animation.
     *
     * @param dir  {string} the direction book page flip to .
     * @param page {number} the page number book page neef flip to .
     * @returns {boolean}
     * @private
     */
    _action: function(dir, page) {
      console.time("prepare animation");
      console.timeEnd("click trigger");
      // if the animation is doing now.
      if (this.isAnimating) return false;

      this.isAnimating = true;

      // prev page always equal to the number of previous activation page, whether this.end is true.
      this.prevPage = this.activePage;

      var i;
      if (page !== undefined && !isNaN(page)) {
        if (dir === "next") {
          for (i = this.activePage; i < page - 1; i++) {
            this.$items.eq(i).addClass("notransition");
            this.$items.eq(i).addClass("turned");
            // this.$items.eq(i)[0].offsetHeight;
            this.$items.eq(i).removeClass("notransition");
          }
        } else if (dir === "prev") {
          for (i = this.activePage - 2; i > page - 1; i--) {
            this.$items.eq(i).addClass("notransition");
            this.$items.eq(i).removeClass("turned");
            // this.$items.eq(i)[0].offsetHeight;
            this.$items.eq(i).removeClass("notransition");
          }
        }

        if (this.activePage === page &&
            (this.activePage === (this.itemsCount) || this.activePage === 1)) {
          this.end = true;
        }
        this.activePage = page;
      } else if (dir === "next") {

        if (this.activePage === (this.itemsCount)) {
          this.end = true;
        } else {
          this.activePage += 1;
        }

      } else if (dir === "prev") {

        if (this.activePage === 1) {
          this.end = true;
        } else {
          this.activePage -= 1;
        }

      }

      // callback trigger   1ms - 9ms
      this.options.onstart(this.prevPage, this.activePage);

      if (!dir) throw new Error("You don't give me the direction");

      switch (dir) {
        case "next":
          this._doNext();
          break;
        case "prev":
          this._doPrev();
          break;
        default:
          throw new Error("Your program has a bug.");
          break;
      }
    },
    _doNext: function() {
      var $prev = this.$items.eq(this.prevPage - 1),
          $active = this.$items.eq(this.activePage - 1);

      // End animation
      if (this.end) return this._doEnd("next");

      $prev.addClass("turned");
      $prev.removeClass("active");
      $active.addClass("active");
      this._reset();
      this._async(function() {
        this.options.onend(this.prevPage, this.activePage);
      }, 200);
    },
    _doPrev: function() {
      var $prev = this.$items.eq(this.prevPage - 1),
          $active = this.$items.eq(this.activePage - 1);

      if (this.end) return this._doEnd("prev");

      // add transition css
      $prev.removeClass("active");
      $active.addClass("active");
      $active.removeClass("turned");
      this._reset();
      this._async(function() {
        this.options.onend(this.prevPage, this.activePage);
      }, 200);

    },
    /**
     * When the active page is first page or the last page ,
     * the page can't be fliped.
     *
     * @param {string} dir the direction of flip animation.
     * @private
     */
    _doEnd: function(dir) {
      var $el = dir === 'next' ? this.$items.last() : this.$items.first();
      var style = dir === 'next' ? 'animation-next-end' : 'animation-prev-end';

      this._async(function() {
        // Add animation class and bind transition end function to end element.
        $el.addClass(style)
          .one(this.transEndEventName, function() {
            $el.removeClass("animation-next-end  animation-prev-end");

            // Reset book flip
            this._reset();

            this._async(function() {
              this.options.onend(this.prevPage, this.activePage);
            });
          }.bind(this));
      });


    },
    /**
     * initialize animation status
     * @private
     */
    _reset: function() {
      this.end = false;
      this.isAnimating = false;
    },
    /**
     * Async func and bind its `this` points to BookSlide.
     *
     * @param func
     * @param time
     * @private
     */
    _async: function(func, time) {
      time = time || 20;
      setTimeout(func.bind(this), time);
    },

    // public method: flips next
    next: function() {
      this._action('next');
    },
    // public method: flips back
    prev: function() {
      this._action('prev');
    },

    // public method: goes to a specific page
    jump: function(page) {

      // if page isn't  an int number,
      // or page is less than zero or page is bigger than page total number,
      // or page is active page,
      // do nothing.
      if (page != parseInt(page) || page < 1 || page === this.activePage || page > this.itemsCount) {
        return false;
      }

      page = parseInt(page);

      this._action(page > this.activePage ? 'next' : 'prev', page);

    },
    // public method: check if isAnimating is true
    isActive: function() {
      return this.isAnimating;
    }

  };
  return BookSlide;

});