build: 
	mkdir -p build
	cat js/knockout.widgets.jquery.exteneders.js\
		js/knockout.util.widgets.js\
		js/knockout.widgets.js > build/knockout.widgets.dev.js
	uglifyjs build/knockout.widgets.dev.js > build/knockout.widgets.min.js

clean:
	rm -r build

.PHONY: build

