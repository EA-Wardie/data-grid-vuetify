# Data Grid Vuetify

### Data grid package used to render advanced grids with a matching back-end package.

#### Allows for searching, filtering, paging & some other advanced features.

## Installation

You can install the package via composer:

```bash
npm install data-grid-vuetify
```

Please also note that a companion back-end [package](https://github.com/EA-Wardie/data-grid-laravel) is required to use this package to it's fullest:

```bash
composer require eawardie/data-grid-laravel
```

## Usage
In you `main.js` or `app.js` register this package as a Vue plugin.

```javascript
import DataGrid from 'data-grid-vuetify';

Vue.use(DataGrid);
```

After registering the package the main component can be used as such.

```html

<data-grid :data="data"></data-grid>
```

The data property here receives its data from the data-grid-laravel package on the back-end.

### Properties

#### selectable
The `selectable` property allows for row selection by checkboxes on the data grid itself.
Using this property also **requires** the use of the `item-value` property.

#### item-value
The `item-value` property is used to indicate a unique item identifier.
The property is only intended for use with the `seectable` property.

#### return-object
The `return-object` property returns the entire item object on select instead on the associated item value from the `item-value` property.

#### actions
The `actions` property is used to pass actions to the actions to each data grid item row.
Actions consist of an `array` of objects that build actions with a series of properties.
these are covered below:

- `color` - Sets the color of the action
- `label` - Sets the action label
- `icon` - Sets the icon - takes a string or callback for dynamic icons - `bind(this)`
- `confimation` - Apply a confirmation dialog on action event using this string - `more info below`
- `disabled` - Sets whether the action should be disabled
- `show` - Evaluates if the action should be displayed, receives a callback - `bind(this)`
- `closure` - Callback function called by the action event itself - `bind(this)`

The confirmation property can be used in a more advanced way to edit the look and feel of the confirmation dialog.
Either pass a string for the confirmation message, or a set of options via object notation.
The example below shows all available options.

```javascript
confirmation: {
   title: '<title>',
      text: '<text>',
      buttons: {
      cancel: {
          text: '<cancel button text>',
          color: '<cancel button color>',
      },
      confirm: {
          text: '<confirm button text>',
          color: '<confirm button color>',
      },
   },
},
```

#### additional-actions
The `aditional-actions` property is used to pass additional actions to the actions drawer for the data-grid.
These actions operate the same as the `actions` property.

#### hide-additional-actions
The `hide-additional-actions` hides the action's drawer if it is not being used.

#### value / v-model
The `value` property is used to get the current selected items on the data-grid.
For auto synced values use `v-model` instead.

#### `drawer`
The `drawer` property can be used to mutate the additional actions drawer state from outside.
Simply pass a data property to this property and change it as needed.

#### `close-drawer-on-data-changes`
The `close-drawer-on-data-changes` property can be used to force close the drawer when any data changes occur.
Data changes can include but are not limited to:
- Applying a search query
- Applying a filter
- Sorting data
- Changing pages

### Events

#### `@click:row`
The `@click:row` event can be used to enable clicking on data grid rows.
The event payload will be the row item itself.
