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

        opt = $.extend({cursor: "move", parent: -1, callback: function(){}}, opt);

        var $el = this;
        var $parent = opt.parent === -1 ? $el.parent() : $(opt.parent);

        return $el.css('cursor', opt.cursor).on("mousedown",function (e) {

            var $drag = $(this).addClass('draggable');

            var z_idx = $drag.css('z-index'),
                drg_w = $drag.outerWidth(),
                pos_x = $drag.offset().left + drg_w - e.pageX;
            $drag.css('z-index', 1000)
            .on("mousemove", function (e) {
                var left = e.pageX + pos_x - drg_w;

                //  Assert that left be between the left and right edges of $parent
                var min = $parent.offset().left;
                var max = min + $parent.width() - $el.width();
                left = Math.max(min, Math.min(left, max));

                opt.callback.call(opt.callback, (left-min) / (max-min));

                $('.draggable').offset({left: left})
                .on("mouseup", function () {
                    $(this).removeClass('draggable').css('z-index', z_idx);
                });
             });
            e.preventDefault(); // disable selection
        }).on("mouseup", function () {
                $el.removeClass('active-handle').off("mousemove").off("mouseup").removeClass('draggable');
        });

    };

    $.fn.slideto = function (percent, speed) {
        speed = typeof speed !== 'undefined' ? speed : '500';
        var $el = this;
            $parent = $el.parent(),
             min = $parent.offset().left,
             max = min + $parent.width() - $el.width(),
             newLeft = (max-min) * percent + min;

        // Save us from calling animate if unessicary
        if (Math.floor(newLeft) == Math.floor($el.offset().left)) return;

        $el.animate({
            offsetLeft: newLeft
        }, speed);
    }
})(jQuery);