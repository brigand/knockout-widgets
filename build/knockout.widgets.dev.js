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

        $el.animate({
            left: newLeft
        }, speed);
    }
})
    (jQuery);
ko.widgets = ko.widgets || {};

ko.widgets.once = function(callback){
    var action = function(){
        if (!action.happened) {
            action.happened = true;
            return callback.apply(this, arguments);
        }
        else {
            return action._then.apply(this, arguments);
        }
    };

    /* Sets what should be called after the first call */
    action.then = function(next){
        action._then = next;
        return action;
    };

    action.happened = false;
    action._then = function(){};

    return action;
};
ko.observable.fn.toggle = function(){
    var observable = this;

    // Initially set it to the boolean version of itself
    observable(!!observable());

    return (function(){
        // When called, flip the value and store it back in the variable
        observable(!observable());
    });
};

ko.subscribable.fn.append = function(what){
    var observable = this;
    return ko.computed(function(){
        return observable() + what;
    });
};

ko.debug = function(a, b, c, d){
    console.log("DEBUG", a, b, c, d);
    return '';
};
var unwrap = ko.utils.unwrapObservable;
var identity = function(x) { return x; };

/* Simple slider

 */
ko.bindingHandlers.slider = {
    init: function(element, valueAccessor, allBindingsAccessor) {
        var value = valueAccessor(),
            allBindings = allBindingsAccessor(),
            min = unwrap(allBindings.sliderMin) || 0,
            max = unwrap(allBindings.sliderMax) || 1,
            round = unwrap(allBindings.round);

        if (typeof round !== "function")
            round = round ? Math.round : identity;

        percent = round(unwrap(value)) / (max - min);

        // Used to prevent changing value during a drag
        element.dataset.protected = false;

        $(element).slideable({
            callback: function(newPercent){
                valueAccessor()((max-min) * newPercent + min);
            }
        });
    },
    update: function(element, valueAccessor, allBindingsAccessor) {
        var value = valueAccessor(),
            allBindings = allBindingsAccessor(),
            min = unwrap(allBindings.sliderMin) || 0,
            max = unwrap(allBindings.sliderMax) || 1,
            round = unwrap(allBindings.round),
            percent = 0;

        percent = unwrap(value) / (max - min);

        if (typeof round !== "function")
            round = round ? Math.round : identity;

        // Don't update if we're sliding
        if(element.dataset.protected === "true") {
            return;
        }


        value(round(value()));

        $(element).slideto(percent);
    }
};

ko.bindingHandlers.slideVisible = visibility($.prototype.slideDown, $.prototype.slideUp);
ko.bindingHandlers.fadeVisible = visibility($.prototype.fadeIn, $.prototype.fadeOut);

function visibility(show, hide, kind){
    var handle = function(element, valueAccessor, allBindingsAccessor) {
            var value = unwrap(valueAccessor()),
                allBindings = allBindingsAccessor(),
                speed = allBindings.speed || 400;

            if (value) {
                show.call($(element), speed);
            }
            else {
                hide.call($(element), speed);
            }
    };

    if (typeof kind === "undefined" || kind === "both") {
        return {
            init: visibility($.prototype.show, $.prototype.hide, "init"),
            update: handle
        };
    }
    else if (kind === "init" || kind === "update") {
        return handle;
    }
}

