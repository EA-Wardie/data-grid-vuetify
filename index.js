import DataGrid from './DataGrid';

export default {
    install(Vue) {
        Vue.component('data-grid', DataGrid);
        Vue.directive('drawer', {
            update: (el, binding, vnode) => {
                if (binding.value !== binding.oldValue) {
                    vnode.context.$children[0]['additionalActionDrawer'] = binding.value;
                }
            },
        });
    }
}
