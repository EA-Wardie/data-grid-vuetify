const DataGrid = {};

DataGrid.install = (Vue) => {
    Vue.component('data-grid', require('./DataGrid').default);
}

export default DataGrid;