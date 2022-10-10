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