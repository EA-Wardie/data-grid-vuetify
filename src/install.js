
export const Framework = {};

Framework.install = function (Vue) {
    Vue.component('data-grid', require('./DataGrid').default);
}