import DataGrid from "@/DataGrid";

const DataGridMain = {
    install(Vue) {
        Vue.component('data-grid', DataGrid);
    }
};

if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(DataGridMain);
}

export default DataGridMain;