var unwrap = ko.utils.unwrapObservable;
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
                    $.each(selected.parentNode.children, function(index, node) {
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

        $.each(value, function(event, observable){
            if (observable()) {

                // Prefer DOM
                if (typeof element[event] === "function") {
                    element[event]();
                }

                // Then jQuery function
                else if (typeof $element[event] === "function") {
                    $element[event]();
                }

                // Then general trigger event
                else {
                    $element.trigger(event);
                }

                // Restore the event to false, now that it's been triggered
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
            } else if (typeof FileReader === "function") {
                var reader = new FileReader();
                reader.onload = function(e) {
                    bindings.fileBinaryData(e.target.result);
                };
                reader.readAsArrayBuffer(file);
            }
        }

        if (bindings.fileDataURI && ko.isObservable(bindings.fileDataURI)) {
            if (typeof FileReader === "function") {
                var reader = new FileReader();
                reader.onload = function(e) {
                    bindings.fileDataURI(e.target.result);
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


