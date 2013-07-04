ko.bindingHandlers.slider = {
    init: function(element, valueAccessor) {
        $(element).slideable({
            callback: valueAccessor()
        });
    },
    update: function(element, valueAccessor) {
        var percent = ko.utils.unwrapObservable(valueAccessor());
        $(element).slideto(percent);
    }
};