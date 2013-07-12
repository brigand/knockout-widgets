/* Modified version of Chris Coyer's Snippet:
 http://css-tricks.com/snippets/jquery/draggable-without-jquery-ui/
 */
/*
 cursor: the css cursor to display when moving
 parent: a jQuery compatible object to bind the slider to
 data: a function that's called back with the percentage representation of this slider
 */
(function ($) {
    $.fn.slideable = function (opt) {

        opt = $.extend({cursor: "move", parent: -1, callback: function () {
        }}, opt);

        var $el = this;
        var $parent = opt.parent === -1 ? $el.parent() : $(opt.parent);
        var $document = $(document);

        $el.offset({left: 0});

        return $el.on("mousedown", function (e) {
            $family = $($el, $el.parents());
            $document.one("mouseup", function () {
                $el.get(0).dataset.protected = false;
                $document.off("mousemove").off("mouseup");
            });

            $el.get(0).dataset.protected = true;

            var z_idx = $el.css('z-index'),
                drg_w = $el.outerWidth(),
                pos_x = $el.offset().left + drg_w - e.pageX;

            $document.on("mousemove", function (e) {
                var left = e.pageX + pos_x - drg_w;

                //  Assert that left be between the left and right edges of $parent
                var min = $parent.offset().left;
                var max = min + $parent.width() - $el.width();
                left = Math.max(min, Math.min(left, max));

                opt.callback.call(opt.callback, (left - min) / (max - min));

                $el.offset({left: left});

                return false;
            });
        });
    };

    $.fn.slideto = function (percent, speed) {
        speed = typeof speed !== 'undefined' ? speed : '500';
        var $el = this;
        $parent = $el.parent(),
            min = $parent.offset().left,
            max = min + $parent.width() - $el.width(),
            newLeft = (max - min) * percent;

        $el.trigger("mouseup");

        return $el.animate({
            left: newLeft
        }, speed);
    }

    /**
     * bind before all other handlers
     * used to avoid some otherwise unavoidable conflicts internally
     * jQuery recommends against this, because it uses an undocumented API
     * it should be compatible with 1.4.8 through 2.0.X, but no garentee
     * @param name The event to watch for, e.g., 'click'
     * @param fn The callback function, works like any jQuery callback
     * @returns {*}
     */
    $.fn.bindFirst = function(name, fn) {
        var handlers;
        // bind as you normally would
        // don't want to miss out on any jQuery magic
        this.bind(name, fn);

        // Thanks to a comment by @Martin, adding support for
        // namespaced events too.
        if (typeof $._data === 'function') {
            handlers = $._data(this, 'events')[name.split('.')[0]];
        }
        else {
            handlers = this.data('events')[name.split('.')[0]];
        }

        // take out the handler we just inserted from the end
        var handler = handlers.pop();

        // move it to the beginning
        handlers.splice(0, 0, handler);

        return this;
    };
})(jQuery);
