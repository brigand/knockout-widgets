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
