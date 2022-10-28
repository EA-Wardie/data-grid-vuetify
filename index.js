import DataGrid from './DataGrid';

export default {
    install(Vue) {
        Vue.component('data-grid', DataGrid);
        Vue.component('DataGrid', DataGrid);
    }
}
