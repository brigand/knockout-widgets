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

        value(round(value()));

        $(element).slideto(percent);
    }
};
