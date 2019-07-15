/*!
 * Autocomplete v0.1.0
 * Docs & License: https://github.com/comodinx/jquery-autocomplete
 * (c) 2018 Nicolás Molina
 *
 * Inspired by Bootstrap Tooltip Plugin
 */

+(function(document, $, undefined) {
    // Constants
    var REGEXP_ESCAPE = /[\-\[\]{}()*+?.,\\\^$|#\s]/g;

    var NAME = 'autocomplete';
    var VERSION = '0.1.0';
    var EVENT_KEY = '.' + NAME;

    var Event = {
        INPUT: 'input' + EVENT_KEY,
        CLICK: 'click' + EVENT_KEY,
        CLEAN: 'clean' + EVENT_KEY,
        KEYDOWN: 'keydown' + EVENT_KEY,
        DESTROY: 'destroy' + EVENT_KEY,
        SELECTED: 'selected' + EVENT_KEY,
        CLOSED: 'closed' + EVENT_KEY
    };

    var Defaults = {
        // Define items
        items: [],

        // Define max item showing on filter
        maxItems: 5,

        // Define property for filter item on filter
        value: 'value',

        // Define property for showing item on select
        text: 'value',

        // Define class for active item
        itemActiveClass: NAME + '-active',

        // Define template for item filter matching
        itemHighlightTemplate: '<b class="font-weight-bold">$&</b>',

        // Items container filter options
        tagItemsContainer: 'div',
        tagItemsClass: NAME + '-items',
        tagItemsIdSuffix: '-' + NAME + '-list',

        // Item container filter options
        tagItemContainer: 'div',
        tagItemClass: NAME + '-item',

        // Enable or disable case sensitive
        caseSensitive: false,

        // Enable or disable when click outside autocomplete suggestion
        enableCloseOnClickOutside: true,

        // Enable or disable calculate absolute position
        calculatePosition: true,

        // Width autocomplete list. Default is the same width to the input
        width: null,

        // Offset Top autocomplete list. Default is the same height to the input + 10px
        offsetTop: 10,

        // Offset Left autocomplete list. Default is the same left offset position to the input + 0px
        offsetLeft: 0,
    };


    // AUTOCOMPLETE PUBLIC CLASS DEFINITION
    // ====================================

    function Autocomplete(element, options) {
        this.$element = $(element);

        // Merge autocomplete options with defaults
        this.config = this._getConfig(options);

        // The autocomplete function takes two arguments, the text field element and an array of possible autocompleted values:
        this.currentFocus;

        // The autocomplete container ID
        this.idContainer = '#' + element.id + this.config.tagItemsIdSuffix;

        // Listen all necesary events
        this._setListeners();
    }

    var _proto = Autocomplete.prototype;

    // Public
    _proto.value = function(item) {
        item = item || this.selected();
        return this._result(item, this.config.value, item);
    };

    _proto.text = function(item) {
        item = item || this.selected();
        return this._result(item, this.config.text, item);
    };

    _proto.selected = function(selected) {
        var filter, autocomplete = this;

        // Find selected item
        if (selected) {
            this._selected = null;

            filter = $.grep(this.config.items, function(item) {
                return autocomplete.value(selected) === autocomplete.value(item) || autocomplete.text(selected) === autocomplete.text(item);
            });
            if (filter && filter.length) {
                this._selected = filter[0];
            }

            if (this._selected) {
                // Trigger event when autocomplete selecting:
                this.$element
                    .val(this.text(this._selected))
                    .trigger(Event.SELECTED, [this.value(this._selected), this.text(this._selected)]);
            }
        }
        return this._selected;
    };

    _proto.clean = function() {
        var selected = this._selected;

        this._selected = null;
        // Trigger event when autocomplete selecting:
        this.$element
            .val(this.text(this._selected))
            .trigger(Event.CLEAN);
        return selected;
    };

    _proto.close = function() {
        $(this.idContainer).remove();

        // Trigger event when autocomplete closed:
        this.$element.trigger(Event.CLOSED);
    };

    _proto.closeAll = function(elem) {
        var autocomplete = this;

        // Close all autocomplete lists in the document, except the one passed as an argument:
        $('.' + this.config.tagItemsClass).each(function() {
            if (elem != this && elem != autocomplete.$element[0]) {
                $(this).remove();
            }
        });
    };

    _proto.destroy = function() {
        var autocomplete = this;

        this.$element.trigger(Event.DESTROY);
        $.each(Event, function(i, event) {
            autocomplete.$element.off(event);
        });
        this.$element.removeData(NAME);
    };

    // Private
    _proto._getConfig = function(options) {
        var config = $.extend({}, $.fn.autocomplete.Defaults, this.$element.data(), options || {});

        if (typeof config.items === 'string') {
            config.items = config.items.split(',');
        }
        if (typeof config.maxItems === 'string') {
            config.maxItems = Number(config.maxItems);
        }
        if (typeof config.enableCloseOnClickOutside === 'string') {
            config.enableCloseOnClickOutside = config.enableCloseOnClickOutside === 'true' || config.enableCloseOnClickOutside === '1';
        }
        return config;
    }

    _proto._setListeners = function() {
        var autocomplete = this;

        // Execute a function when someone writes in the text field:
        this.$element.on(Event.INPUT, function(e) {
            var val = this.value;

            // Close any already open lists of autocompleted values
            autocomplete.closeAll();
            if (!val) return false;
            autocomplete.currentFocus = -1;

            autocomplete._showItemsFilter(val);
        });

        // Execute a function presses a key on the keyboard:
        this.$element.on(Event.KEYDOWN, function(e) {
            var x = $(autocomplete.idContainer + ' ' + autocomplete.config.tagItemContainer);

            // If the arrow DOWN key is pressed, increase the currentFocus variable:
            if (e.keyCode == 40) {
                autocomplete.currentFocus++;
                // And and make the current item more visible:
                autocomplete._addActive(x);
            }

            // If the arrow UP key is pressed,
            else if (e.keyCode == 38) {
                // Up decrease the currentFocus variable:
                autocomplete.currentFocus--;
                // And and make the current item more visible:
                autocomplete._addActive(x);
            }

            // If the ENTER key is pressed, prevent the form from being submitted,
            else if (e.keyCode == 13) {
                e.preventDefault();
                if (autocomplete.currentFocus > -1) {
                  // And simulate a click on the 'active' item:
                  if (x.length) x[autocomplete.currentFocus].click();
                }
            }
        });

        if (this.config.enableCloseOnClickOutside) {
            // Execute a function when someone clicks in the document:
            document.addEventListener('click', function(e) {
                autocomplete.closeAll(e.target);
            });
        }
    };

    _proto._showItemsFilter = function(val) {
        var i, w, container, tag, items, text, autocomplete = this;

        // Create a DIV element that will contain the items (values):
        container = $('<' + this.config.tagItemsContainer + '/>')
            .attr('id', this.idContainer.replace('#', ''))
            .addClass(this.config.tagItemsClass);

        if (this.config.calculatePosition) {
            container.css({
                position: 'absolute',
                left: this.$element.offset().left + this.config.offsetLeft,
                top: this.$element.offset().top + this.$element.height() + this.config.offsetTop
            });
        }

        // Define container style:
        if (this.config.width) {
            container.css('width', this.config.width);
        }
        else {
            container.css('width', this.$element.outerWidth());
        }

        // Append the DIV element as a child of the autocomplete container:
        container.appendTo(this.$element.parent());

        // For each item in the array...
        items = this._filterItems(val);

        for (i = 0; i < items.length; i++) {
            text = this.text(items[i]);

            // Create a DIV element for each matching element:
            tag = $('<' + this.config.tagItemContainer + '/>')
                .addClass(this.config.tagItemClass)

                // Make the matching letters bold:
                .html(this._highlight(text, val))

                // Insert a data that will hold the current array item's id, value and text:
                .data('value', this.value(items[i]))
                .data('text', text);

            // Execute a function when someone clicks on the item value (DIV element):
            tag.on('click', function(e) {
                autocomplete.selected($(this).data('value'));
                // Close the list of autocompleted values, (or any other open lists of autocompleted values:
                autocomplete.close();
            });

            tag.appendTo(container);
        }
    }

    _proto._filterItems = function(term) {
        var autocomplete = this;
        var matcher = new RegExp(this._escapeTerm(term), !this.config.caseSensitive ? 'i' : null);
        var results = [];

        $.each(this.config.items, function(i, item) {
            if (results.length === autocomplete.config.maxItems) {
                return false;
            }
            if (matcher.test(autocomplete.text(item))) {
                results.push(item);
            }
        });
        return results;
    }

    _proto._addActive = function(x) {
        // A function _to classify an item as 'active':
        if (!x.length) return false;

        // Start by removing the 'active' class on all items:
        this._removeActive(x);

        // Setup current focus index:
        if (this.currentFocus >= x.length) this.currentFocus = 0;
        if (this.currentFocus < 0) this.currentFocus = (x.length - 1);

        // Add class 'autocomplete-active':
        $(x[this.currentFocus]).addClass(this.config.itemActiveClass);
    }

    _proto._removeActive = function(x) {
        // A function to remove the 'active' class from all autocomplete items:
        $(x).removeClass(this.config.itemActiveClass);
    }

    _proto._highlight = function(text, term) {
        return text.replace(new RegExp(term + '(?!([^<]+)?<)', 'gi'), this.config.itemHighlightTemplate);
    }

    _proto._escapeTerm = function(term) {
        return term.replace(REGEXP_ESCAPE, '\\$&');
    }

    _proto._result = function(target, keys, defaultValue) {
        let value;

        keys = keys || [];
        defaultValue = (typeof defaultValue === 'undefined') ? null : defaultValue;

        if (!Array.isArray(keys)) {
            keys = [keys];
        }
        if (!keys.length) {
            return defaultValue;
        }

        keys.every((key, index) => {
            try {
                value = !index ? target[key] : value[key];
            }
            catch (e) {
                value = null;
                return false;
            }
            return true;
        });
        return (typeof value === 'undefined' || value === null) ? defaultValue : value;
    }

    function _createClass(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];

            descriptor.enumerable = false;
            descriptor.configurable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
        return target;
    }

    _createClass(Autocomplete, [{
        key: 'VERSION',
        get: function get() {
            return VERSION;
        }
    }, {
        key: 'Default',
        get: function get() {
            return Default;
        }
    }, {
        key: 'NAME',
        get: function get() {
            return NAME;
        }
    }, {
        key: 'Event',
        get: function get() {
            return Event;
        }
    }, {
        key: 'EVENT_KEY',
        get: function get() {
            return EVENT_KEY;
        }
    }]);

  
    // AUTOCOMPLETE PLUGIN DEFINITION
    // ==============================

    var old = $.fn.autocomplete;
  
    $.fn.autocomplete = function (options, args) {
        return this.each(function() {
            var $this = $(this);
            var data = $this.data(NAME);

            if (!data) $this.data(NAME, (data = new Autocomplete(this, options)));
            if (typeof options == 'string') data[options].apply(data, Array.isArray(args) ? args : [args]);
        });
    };

    $.fn.autocomplete.Constructor = Autocomplete;
    $.fn.autocomplete.Defaults = Defaults;


    // AUTOCOMPLETE NO CONFLICT
    // ========================

    $.fn.autocomplete.noConflict = function() {
        $.fn.autocomplete = old;
        return this;
    };


    // AUTOCOMPLETE DATA-API
    // =====================

    $(document).on('click.' + NAME + '.data-api', '[data-provides="' + NAME + '"]', function (e) {
        var $this = $(this);

        if ($this.data(NAME)) return;
        $this.autocomplete($this.data());
      
        var $target = $(e.target).closest('[data-dismiss="' + NAME + '"],[data-trigger="' + NAME + '"]');
        if ($target.length > 0) {
            e.preventDefault();
            $target.trigger(Event.CLICK);
        }
    });

})(document, jQuery);
