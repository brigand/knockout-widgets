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

