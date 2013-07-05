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

            $el.get(0).dataset.protected = true;

            var $drag = $(this).addClass('draggable');

            var z_idx = $drag.css('z-index'),
                drg_w = $drag.outerWidth(),
                pos_x = $drag.offset().left + drg_w - e.pageX;
            $drag.css('z-index', 1000).parents()
            .on("mousemove", function (e) {
                var left = e.pageX + pos_x - drg_w;

                //  Assert that left be between the left and right edges of $parent
                var min = $parent.offset().left;
                var max = min + $parent.width() - $el.width();
                left = Math.max(min, Math.min(left, max));

                opt.callback.call(opt.callback, (left-min) / (max-min));

                $('.draggable').offset({left: left})
                .on("mouseup", function () {
                    $el.removeClass('draggable').css('z-index', z_idx)
                        .off("mousemove").off("mouseup")
                        .parents().off("mousemove").off("mouseup");
                    $el.get(0).dataset.protected = false;
                });
             });
            e.preventDefault(); // disable selection
        }).on("mouseup", function () {
                $el.get(0).dataset.protected = false;
                $el.removeClass('active-handle').off("mousemove").off("mouseup").removeClass('draggable');
        });

    };

    $.fn.slideto = function (percent, speed) {
        speed = typeof speed !== 'undefined' ? speed : '500';
        var $el = this;
            $parent = $el.parent(),
             min = $parent.offset().left,
             max = min + $parent.width() - $el.width(),
             newLeft = (max-min) * percent;

        $el.trigger("mouseup");

        $el.animate({
            left: newLeft
        }, speed);
    }
})(jQuery);
var unwrap = ko.utils.unwrapObservable;
var identity = function(x) { return x; };

ko.bindingHandlers.slider = {
    init: function(element, valueAccessor, allBindingsAccessor) {
        var value = unwrap(valueAccessor()),
            allBindings = allBindingsAccessor(),
            min = unwrap(allBindings.sliderMin) || 0,
            max = unwrap(allBindings.sliderMax) || 1,
            round = unwrap(allBindings.round);

        if (typeof round !== "function")
            round = round ? Math.round : identity;

        percent = round(
            ko.utils.unwrapObservable(value) / (max - min)
        );

        // Used to prevent changing value during a drag
        element.dataset.protected = false;

        $(element).slideable({
            callback: function(newPercent){
                valueAccessor()((max-min) * newPercent + min);
            }
        }).slideto(round(unwrap(percent)));
    },
    update: function(element, valueAccessor, allBindingsAccessor) {
        var value = valueAccessor(),
            allBindings = allBindingsAccessor(),
            min = unwrap(allBindings.sliderMin) || 0,
            max = unwrap(allBindings.sliderMax) || 1,
            round = unwrap(allBindings.round),
            percent = 0;

        if (typeof round !== "function")
            round = round ? Math.round : identity;

        // Don't update if we're sliding
        if(element.dataset.protected === "true") {
            console.log('protect', percent);
            return;
        }

        percent = ko.utils.unwrapObservable(value) / (max - min);

        value(round())

        $(element).slideto(percent);
    }
};
