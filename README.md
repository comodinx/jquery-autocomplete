# Autocomplete
----

Documentation and examples for adding custom Autocomplete with CSS and JavaScript.

## Overview

This component was born with the purpose of preventing multiple elements from being loaded several times through ajax.

My problem was to have 2 combos with the same 10,000 elements.
My solution was to load the elements to be used in the component once and reuse them. No need to render them all in HTML.

## Usage

```html
    <input id="element" placeholder="Select your preference programming language...">
```

```javascript
$(function () {
    $('#element').autocomplete({
        value: 'id',
        items: [{
            id: 1,
            value: 'Javacript'
        }, {
            id: 2,
            value: 'Java'
        }, {
            id: 3,
            value: 'PHP'
        }, {
            id: 3,
            value: 'Ruby'
        }]
    })
})
```

## Options
Options can be passed via data attributes or JavaScript. For data attributes, append the option name to data-, as in data-items="Javascript,Java,PHP,Ruby".
```javascript
{
    // Define items
    items: [],

    // Define max item showing on filter
    maxItems: 5,

    // Define property for filter item on filter
    value: 'value',

    // Define property for showing item on select
    text: 'value',

    // Define class for active item
    itemActiveClass: 'autocomplete-active',

    // Define template for item filter matching
    itemHighlightTemplate: '<b class="font-weight-bold">$&</b>',

    // Items container filter options
    tagItemsContainer: 'div',
    tagItemsClass: 'autocomplete-items',
    tagItemsIdSuffix: '-' + 'autocomplete-list',

    // Item filtered options
    tagItemContainer: 'div',
    tagItemClass: 'autocomplete-item',

    // Enable or disable case sensitive
    caseSensitive: false,

    // Enable or disable when click outside autocomplete suggestion
    enableCloseOnClickOutside: true,

    // Enable or disable calculate absolute position
    calculatePosition: true,

    // Width of autocomplete list. Default is the same width to the input. Posibles values is the same accepted by jquery css function  
    width: null,

    // Offset Top autocomplete list. Default is the same height to the input + 10px
    offsetTop: 10,

    // Offset Left autocomplete list. Default is the same left offset position to the input + 0px
    offsetLeft: 0
}
```

## Methods

### $().autocomplete(options)
Attaches a autocomplete handler to an element collection.

### .autocomplete('selected')
Force the manual selection of an item if it exists between the items. Trigger event `selected` when item exists between the items.
```javascript
    // item = 1
    // item = 'Javascrip'
    // item = {id: 1}
    // item = {value: 'Javascrip'}
    // item = {id: 1, value: 'Javascrip'}
    $('#element').autocomplete('selected', item)
```

### .autocomplete('clean')
Clean the selected item if it exists. Trigger event `clean`
```javascript
    $('#element').autocomplete('clean')
```

### .autocomplete('close')
Close autocomplete. Trigger event `closed`
```javascript
    $('#element').autocomplete('close')
```

### .autocomplete('closeAll')
Close all autocomplete on document
```javascript
    $('#element').autocomplete('closeAll')
```

### .autocomplete('destroy')
Remove autocomplete events. Trigger event `destroy`
```javascript
    $('#element').autocomplete('destroy')
```

## Instance Methods

### .data('autocomplete').selected()
Return selected item
```javascript
    $('#element').data('autocomplete').selected()
```

### .data('autocomplete').value()
Return selected item value
```javascript
    $('#element').data('autocomplete').value()
```

### .data('autocomplete').text()
Return selected item text
```javascript
    $('#element').data('autocomplete').text()
```

## Events
<table class="table table-bordered table-striped">
    <thead>
        <tr>
            <th style="width: 150px;">Event Type</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>selected.autocomplete</td>
            <td>This event fires immediately when the <code>select</code> item.</td>
        </tr>
        <tr>
            <td>clean.autocomplete</td>
            <td>This event is fired call method <code>.autocomplete('clean')</code>.</td>
        </tr>
        <tr>
            <td>closed.autocomplete</td>
            <td>This event is fired call method <code>.autocomplete('close')</code> or after closing the item container when a selection was made.</td>
        </tr>
        <tr>
            <td>destroy.autocomplete</td>
            <td>This event is fired call method <code>.autocomplete('destroy')</code>.</td>
        </tr>
    </tbody>
</table>

```javascript
    $('#element').on('selected.autocomplete', function () {
        // do something…
    })
```
