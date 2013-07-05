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

        $el.animate({
            left: newLeft
        }, speed);
    }
})
    (jQuery);
