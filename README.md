knockout-widgets
================

### easy to insert widgets for KnockoutJS

## Mission

Your HTML is your HTML, your JavaScript is your JavaScript.  Let's keep JavaScript thinking about data, 
and not about presentation.  

* We'll provide methods for displaying your `observables`, using new bindings.  
* Helper functions will be provided for keeping bindings simple
* Your data and view will be in sync; in both directions; at all times

## How to Use

Download `knockout.widgets.min.js` and link it to your page.  KnockoutJS and jQuery are also required.

Write your `ViewModel` code.  For example:

    function ViewModel(){
        var self = this;

        // Simplicity Percentage
        self.simplicity = ko.observable(0.999);
    }

    ko.applyBindings(window.app = new ViewModel());

Include the data bindings in your view.

<div class="slider">
        <img data-bind="slider: simplicity" class="target"
                  src="checkmark.gif" />
    </div>

## [Learn More With Interactive Examples](http://brigand.github.io/knockout-widgets/)

## Contributing

Contributions are very much appreciated.  This includes,

 * Writing New Widgets
 * Fixing bugs, or making improvements
 * Writing a Documentation Theme (built with Bootstrap)
 * Documentation
 * Spelling Mistakes
 * Mentioning a Project Using KO-W
 * Anything Else Helpful
