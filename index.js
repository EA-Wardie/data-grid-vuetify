import DataGrid from './DataGrid';

export function install(Vue) {
    if (install.installed) {
        return;
    }

    install.installed = true;
    Vue.component(DataGrid, 'data-grid');
}

const plugin = {
    install,
};

let globalVue = null
if (typeof window !== 'undefined') {
    globalVue = window.Vue;
} else if (typeof global !== 'undefined') {
    globalVue = global.Vue;
}

if (globalVue) {
    globalVue.use(plugin);
}

export default DataGrid;