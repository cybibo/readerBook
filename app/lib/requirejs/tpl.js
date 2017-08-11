/**
 * template loader for requirejs
 * Help people to load template with `tpl!`  
 * @example
 * var template = require("tpl!./test");
 * it will load ./test.tpl file and 
 */
define(function(require,exports,module){
    var pack,
        config = module.config();
    var doT = require("doT");

    pack = {
        load: function (name, req, load, config) {
            req(["text!"+name+'.tpl'], function (value) {
                var tplFunction = doT.compile(value);
                load(tplFunction);
            });
        }
    }
    return pack;
});
