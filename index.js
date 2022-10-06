
export const DataGrid = {};

DataGrid.install = function (Vue) {
    Vue.component('data-grid', require('./DataGrid').default);
}