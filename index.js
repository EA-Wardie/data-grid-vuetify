import DataGrid from './DataGrid';

export default {
    install(Vue) {
        Vue.component('data-grid', DataGrid);
        Vue.component('DataGrid', DataGrid);
        Vue.directive('drawer', {
            update: (el, binding, vnode) => {
                const child = vnode.context.$children.find((child) => child.hasOwnProperty('additionalActionDrawer'));

                if (child) {
                    child.additionalActionDrawer = binding.value;
                }
            },
        });
    }
}
