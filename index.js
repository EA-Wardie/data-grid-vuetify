import DataGrid from './DataGrid';

export default {
    install(Vue) {
        Vue.component('data-grid', DataGrid);
        Vue.directive('drawer', {
            update: (el, binding, vnode) => {
                if (binding.value !== binding.oldValue) {
                    const child = vnode.context.$children.find((child) => child.hasOwnProperty('additionalActionDrawer'));

                    if (child) {
                        child.additionalActionDrawer = binding.value;
                    }
                }
            },
        });
    }
}
