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
