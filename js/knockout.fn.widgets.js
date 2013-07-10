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


ko.observable.fn.set = function(to){
    var observable = this;

    return function(){
        observable(
            // Unwrap so observable.set(otherObservable) works
            ko.utils.unwrapObservable(to)
        );
    };
}

ko.observable.fn.eq = function(to) {
    var observable = this;
    return ko.computed(function(){
        return ko.utils.unwrapObservable(observable) === ko.utils.unwrapObservable(to);
    });
}

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

