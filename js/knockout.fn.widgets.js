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
};