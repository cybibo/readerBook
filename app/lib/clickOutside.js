/**
 * jQuery `clickOutside` custom event
 * Triggers when user clicks anywhere *but*
 * the bound element.
 *
 * How it works:
 *  Check for clicks anywhere on document
 *  Bound element will prevent event from propagating
*/
;(function (factory) {
    if (typeof define === "function" && define.amd) {
        // AMD模式
        define([ "jquery" ], factory);
    } else {
        // 全局模式
        factory(jQuery);
    }
}
(function($) {
    $.event.special.clickOutside = {

        add: function(handleObj) {
            var $el = (handleObj.selector)? $(this).find(handleObj.selector): $(this);
            var ns = "clickOutside." + handleObj.guid;

            // handle click outside of $el
            $(document).on('click.' + ns + ' focus.' + ns, function() {
                $el.trigger('clickOutside');
            });

            // Don't handle click on $el
            $el.on('click.' + ns + ' focus.' + ns, function(e) {
                e.stopPropagation();
            });
        }
    };
}));