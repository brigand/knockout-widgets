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


ko.subscribable.fn.set = function(to){
    var observable = this;

    return function(){
        observable(
            // Unwrap so observable.set(otherObservable) works
            ko.utils.unwrapObservable(to)
        );
    };
};

ko.subscribable.fn.eq = function(to) {
    var observable = this;
    return ko.computed(function(){
        return ko.utils.unwrapObservable(observable) === ko.utils.unwrapObservable(to);
    });
};

ko.observableArray.fn.append = function(what) {
    var self = this;
    return function(){
        self.push(ko.utils.unwrapObservable(what));
    };
};

ko.observableArray.fn.delete = function(what) {
    var self = this;
    return function(){
        self.remove(ko.utils.unwrapObservable(what));
    };
};

/**
 * When this observable changes, we pretend the targets have too
 * @param target an observable, array of observables, or object containing observables; observable arrays are not recursed
 * @param maxDepth the maximum number of recursions, defaults to 3
 * @param delay the number of miliseconds to wait before notifying the subscribers they've mutated
 */
ko.subscribable.fn.infulences = function(target, maxDepth, delay) {
    var self = this;
    if (arguments.length < 2) maxDepth = 3;

    // Observable
    if (ko.isObservable(target)){
        if (typeof delay !== "undefined" && parseInt(delay)) {
            self.subscribe(function(){
                delay = parseInt(delay);
                setTimeout(target.notifySubscribers.bind(target), delay)
            });
        } else {
            self.subscribe(target.notifySubscribers.bind(target));
        }
    }
    // Array or Object
    else if (typeof target === 'object' && maxDepth > 0) {
        $.each(target, function(index, t) {
            self.infulences(t, maxDepth - 1);
        });
    }

    return self;
};var unwrap = ko.utils.unwrapObservable;
var identity = function (x) {
    return x;
};

/* Simple slider

 */
ko.bindingHandlers.slider = {
    init: function (element, valueAccessor, allBindingsAccessor) {
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
            callback: function (newPercent) {
                valueAccessor()((max - min) * newPercent + min);
            }
        });
    },
    update: function (element, valueAccessor, allBindingsAccessor) {
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
        if (element.dataset.protected === "true") {
            return;
        }


        value(round(value()));

        $(element).slideto(percent);
    }
};

ko.bindingHandlers.slideSelect = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        var observable = valueAccessor(), value = unwrap(observable), bindings = allBindingsAccessor(),
            $element = $(element), axis = 'y', whichOffset = 'top', args = arguments, lastValue;

        if (typeof bindings.axis !== "undefined" && unwrap(bindings.axis) === 'x') {
            axis = unwrap(bindings.axis);
            whichOffset = 'left';
        }

        // Save the last value, and fake a call to update if it didn't change, but the user dragged
        lastValue = null;

        $element.draggable({
            axis: axis,
            stop: function () {
                var selected, selectedCenter, selectedData,
                    $parent = $element.parent(), parentPos = $parent.offset()[whichOffset],
                    parentCenter = ( axis === 'x' ? $parent.width() : $parent.height() ) / 2 + parentPos;

                $element.children().each(function (index, child) {
                    var $child = $(child), childPos = $child.offset()[whichOffset],
                        childCenter = ( axis === 'x' ? $child.width() : $child.height() ) / 2 + childPos;


                    // Find the child whos center is closest to the parent's center
                    if (typeof selectedCenter !== "undefined") {
                        if(Math.abs(childCenter - parentCenter) < Math.abs(selectedCenter - parentCenter)){
                            selected = child;
                            selectedCenter = childCenter;
                        }
                    }
                    else {
                        selected = child;
                        selectedCenter = childCenter;
                    }
                });

                // A new item is selectd, so we mark it as selected

                // Number values will recieve the index of the selected node
                if (typeof value === "number") {
                    ko.utils.objectForEach(selected.parentNode.children, function(index, node) {
                        if (node === selected) {
                            selectedData = index;
                        }
                    });

                    if (typeof selectedData === "undefined") {
                        console.warn('slideSelect failed to find a element index matching the selection');
                    }
                }
                else {
                    selectedData = ko.dataFor(selected);
                }
                if (typeof selected !== "undefined") {
                    // Update the value, this causes snapping as per the update method
                    if (typeof selectedData !== 'undefined' && selectedData !== lastValue) {
                        observable(selectedData);
                    }

                    // If the value hasn't changed; fake a call to update
                    else {
                        ko.bindingHandlers.slideSelect.update.apply(null, args);
                    }
                }
                else {
                    console.warn("slideSelect couldn't identify any children")
                }

                lastValue = observable();
            }
        });
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var observable = valueAccessor(), value = unwrap(observable), bindings = allBindingsAccessor(),
            $element = $(element), axis = 'y', whichOffset = 'top', newPosition, $selected;

        if (typeof bindings.axis !== "undefined" && bindings.axis === 'x') {
            axis = bindings.axis;
            whichOffset = 'left';
        }


        if (typeof value === 'number') {
            $selected = $($element.children().get(value));
            if ($selected.length !== 1) $selected = null;
        }

        else if (bindingContext.foreach) {
            var index = bindingContext.foreach.indexOf(value);
            if (index !== -1) {
                $selected = $($element.children().get(index));
            }
        }
        else {
            $element.children().each(function (index, child) {
                if (ko.dataFor(child) === unwrap(value)) {
                    $selected = $(child);
                }
            });
        }


        if ($selected) {
            $element.draggable("disable");
            var $parent = $element.parent(),
                size = ( axis === 'x' ? $parent.width() : $parent.height() ),
                childSize = ( axis === 'x' ? $selected.width() : $selected.height() ),
                leftEdge = $element.offset()[whichOffset] - $selected.offset()[whichOffset],
                newPosition = (size - childSize) / 2 + leftEdge,
                style = {};
            style[whichOffset] = newPosition;

            $element.stop().animate(style);
            $element.draggable("enable");
        }
        else {
            console.warn("slideSelect couldn't focus a child element");
        }
    }
};


ko.bindingHandlers.trigger = {
    init: function(element, valueAccessor, allBindingsAccessor) {

    },

    update: function(element, valueAccessor, allBindingsAccessor) {
        var value = valueAccessor(), $element = $(element);

        ko.utils.objectForEach(value, function(event, observable){
            if (observable()) {
                $element.trigger(event);
                observable(false);
            }
        });
    }
};


ko.bindingHandlers.fileDrop = {
    init: function(element, valueAccessor, allBindingsAccessor) {

    },

    update: function(element, valueAccessor, allBindingsAccessor) {

    }
};

/* Modifided version of this: https://github.com/khayrov/khayrov.github.com/blob/master/jsfiddle/knockout-fileapi/ko_file.js */
ko.bindingHandlers.file = {
    init: function(element, valueAccessor) {
        $(element).change(function() {
            var file = this.files[0];
            if (ko.isObservable(valueAccessor())) {
                valueAccessor()(file);
            }
        });
    },

    update: function(element, valueAccessor, allBindingsAccessor) {
        var file = ko.utils.unwrapObservable(valueAccessor());
        var bindings = allBindingsAccessor();
        var windowURL = window.URL || window.webkitURL;

        if (bindings.fileObjectURL && ko.isObservable(bindings.fileObjectURL)) {
            if (typeof windowURL !== "undefined") {
                var oldUrl = bindings.fileObjectURL();
                if (oldUrl) {
                    windowURL.revokeObjectURL(oldUrl);
                }
                bindings.fileObjectURL(file && windowURL.createObjectURL(file));
            }
            else {
                bindings.fileObjectURL(null);
            }
        }

        if (bindings.fileBinaryData && ko.isObservable(bindings.fileBinaryData)) {
            if (!file) {
                bindings.fileBinaryData(null);
            } else if (typeof FileReader !== "undefined") {
                var reader = new FileReader();
                reader.onload = function(e) {
                    bindings.fileBinaryData(e.target.result);
                };
                reader.readAsArrayBuffer(file);
            }
        }

        if (bindings.fileDataURL && ko.isObservable(bindings.fileDataURL)) {
            if (!file) {
                bindings.fileBinaryData(null);
            } else if (typeof FileReader !== "undefined") {
                var reader = new FileReader();
                reader.onload = function(e) {
                    bindings.fileBinaryData(e.target.result);
                };
                reader.readAsDataURL(file);
            }
        }
    }
};

ko.bindingHandlers.slideVisible = visibility($.prototype.slideDown, $.prototype.slideUp);
ko.bindingHandlers.fadeVisible = visibility($.prototype.fadeIn, $.prototype.fadeOut);

function visibility(show, hide, kind) {
    var handle = function (element, valueAccessor, allBindingsAccessor) {
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


