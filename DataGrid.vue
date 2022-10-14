<template>
    <div>
        <v-card tile
                class="pa-4"
                style="position: absolute; top: 0; left: 0; user-select: none;"
                width="100%"
        >
            <v-row no-gutters justify="space-between" align="center" class="fill-height flex-nowrap">
                <v-col cols="auto" class="flex-shrink-1">
                    <v-row no-gutters align="center" class="flex-nowrap">
                        <v-col cols="auto">
                            <v-menu bottom
                                    :max-width="500"
                                    :min-width="500"
                                    :nudge-bottom="58"
                                    :close-on-content-click="false"
                                    v-model="menus.search"
                            >
                                <template #activator="{ on }">
                                    <v-badge
                                        bordered
                                        color="grey"
                                        overlap
                                        :content="totalCurrentSearches + totalCurrentFilters"
                                        :value="(!Array.isArray(afterPostQueries) && totalCurrentSearches > 0) || totalCurrentFilters > 0"
                                    >
                                        <div v-on="on">
                                            <v-text-field
                                                outlined
                                                hide-details
                                                clearable
                                                prepend-inner-icon="mdi-magnify"
                                                placeholder="Search"
                                                style="width: 600px;"
                                                v-model="data.metaData.search.term"
                                                @click:clear="clearSearch()"
                                                @input="debouncedInitialSearch()"
                                            >
                                                <template #append v-if="advancedColumns.length > 0">
                                                    <v-menu bottom
                                                            left
                                                            :max-width="500"
                                                            :min-width="500"
                                                            :nudge-bottom="47"
                                                            :nudge-right="12"
                                                            :close-on-content-click="false"
                                                            v-model="menus.filter"
                                                    >
                                                        <template #activator="{ on }">
                                                            <v-btn icon
                                                                   style="transform: translateY(-6px);"
                                                                   :color="hasFilters ? 'secondary' : 'grey'"
                                                                   v-on="on"
                                                            >
                                                                <v-icon>mdi-tune</v-icon>
                                                            </v-btn>
                                                        </template>
                                                        <v-card :width="500">
                                                            <filter-menu
                                                                :data="meta.filters"
                                                                :columns="meta.columns"
                                                                :has-layout="hasLayout"
                                                                v-if="menus.filter"
                                                                @filters="applyFilters($event)"
                                                                @clear="clearFilters()"
                                                            ></filter-menu>
                                                        </v-card>
                                                    </v-menu>
                                                </template>
                                                <template #prepend-inner>
                                                    <v-row dense class="flex-nowrap overflow-x-auto px-1 hide-scrollbar" style="max-width: 250px;">
                                                        <v-col cols="auto" :key="queryIndex" v-for="(key, queryIndex) in Object.keys(afterPostQueries)">
                                                            <v-chip small label close @click:close="clearSearchQuery(key)">
                                                                <b>{{ getColumnLabel(key) }}</b>: {{ termsString(afterPostQueries[key]) }}
                                                            </v-chip>
                                                        </v-col>
                                                    </v-row>
                                                </template>
                                            </v-text-field>
                                        </div>
                                    </v-badge>
                                </template>
                                <v-card :width="500">
                                    <search-menu
                                        :value="menus.search"
                                        :data="meta.search"
                                        :columns="meta.columns"
                                        v-if="menus.search"
                                        @search="applySearch($event)"
                                    ></search-menu>
                                </v-card>
                            </v-menu>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col cols="auto" class="flex-grow-1">
                    <header-filter-section
                        :current-total-items="items.length"
                        :meta-data="meta"
                        v-if="page.innerWidth > 1299"
                        @layout="applyLayout($event)"
                        @addLayout="addLayout($event)"
                        @removeLayout="removeLayout($event)"
                        @pageDown="pageDown()"
                        @pageUp="pageUp()"
                        @sort="applySortBy($event)"
                        @view="applyView($event)"
                        @goToPage="goToPage($event)"
                    ></header-filter-section>
                    <v-row no-gutters justify="end" align="center" class="fill-height" v-else>
                        <v-col cols="auto">
                            <v-menu :nudge-bottom="42" :close-on-content-click="false">
                                <template #activator="{ on }">
                                    <v-btn fab small color="primary" v-on="on">
                                        <v-icon>mdi-menu</v-icon>
                                    </v-btn>
                                </template>
                                <v-card class="px-2">
                                    <header-filter-section
                                        :current-total-items="data.items.length"
                                        :meta-data="meta"
                                        @layout="applyLayout($event)"
                                        @addLayout="addLayout($event)"
                                        @removeLayout="removeLayout($event)"
                                        @pageDown="pageDown()"
                                        @pageUp="pageUp()"
                                        @sort="applySortBy($event)"
                                        @view="applyView($event)"
                                        @goToPage="goToPage($event)"
                                    ></header-filter-section>
                                </v-card>
                            </v-menu>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </v-card>
        <div style="margin-top: 72px;">
            <v-row no-gutters justify="space-between" align="center" class="mb-3">
                <v-col cols="auto">
                    <slot name="title">
                        <div class="title">Items</div>
                    </slot>
                </v-col>
                <v-col cols="auto">
                    <v-row no-gutters justify="end" align="center">
                        <v-col cols="auto" v-if="hasFilters">
                            <v-icon color="#2EA2EF">mdi-information</v-icon>
                        </v-col>
                        <v-col cols="auto" class="px-1" v-if="hasFilters">
                            <div>Filters are active in this view</div>
                        </v-col>
                        <v-col cols="auto" v-show="!hideAdditionalActions">
                            <v-badge color="primary" bordered overlap :content="Object.keys(selectedMap).length" :value="Object.keys(selectedMap).length > 0">
                                <v-tooltip color="grey" left :nudge-right="5" :disabled="Object.keys(selectedMap).length === 0">
                                    <template #activator="{ on }">
                                        <v-btn icon v-on="on" @click="additionalActionDrawer = !additionalActionDrawer">
                                            <v-icon :color="additionalActionDrawer ? 'primary' : ''"
                                            >{{ additionalActionDrawer ? 'mdi-menu-open' : 'mdi-menu' }}
                                            </v-icon>
                                        </v-btn>
                                    </template>
                                    <div>With {{ Object.keys(selectedMap).length }} Selected</div>
                                </v-tooltip>
                            </v-badge>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
            <v-row no-gutters class="flex-nowrap">
                <v-col cols="auto" style="transition: width 0.25s;" :style="{ width: additionalActionDrawer ? `calc(100% - ${actionDrawerWidth}px)` : '100%' }">
                    <v-card class="overflow-hidden rounded" style="position: relative;" :loading="loading" :disabled="loading">
                        <v-simple-table fixed-header :height="page.innerHeight - 230">
                            <template #default>
                                <thead>
                                <tr>
                                    <th class="px-2" style="width: 1%;" v-if="selectable">
                                        <v-simple-checkbox
                                            style="transform: translateX(4px);"
                                            class="ma-0 pa-0"
                                            color="secondary"
                                            :disabled="items.length === 0"
                                            :value="selectedItems.length === items.length && items.length !== 0"
                                            :indeterminate="selectedItems.length > 0 && selectedItems.length < items.length"
                                            v-ripple="false"
                                            @input="selectAllItems()"
                                        ></v-simple-checkbox>
                                    </th>
                                    <th :key="index"
                                        :style="{ borderLeft: segmented ? '1px solid rgba(0,0,0,0.12)' : '' }"
                                        v-for="(column, index) in orderedColumns"
                                        v-show="!column.hidden"
                                    >
                                        <v-row no-gutters>
                                            <v-col cols="auto">
                                                <div style="white-space: nowrap;">{{ column.label }}</div>
                                            </v-col>
                                            <v-col cols="auto" class="pl-1" v-if="!!meta.sortBy && meta.sortBy[column.value]">
                                                <v-btn x-small icon @click="changeSortDirection(column)">
                                                    <v-icon x-small>{{ meta.sortBy[column.value] === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}</v-icon>
                                                </v-btn>
                                            </v-col>
                                        </v-row>
                                    </th>
                                    <th style="width: 1%;"
                                        class="px-2"
                                        :style="{ borderLeft: segmented ? '1px solid rgba(0,0,0,0.12)' : '' }"
                                        v-show="items.length > 0 && actions.length > 0"
                                    ></th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr class="clicked"
                                    :style="{
                                        cursor: $listeners && $listeners['click:row'] ? 'pointer' : 'default',
                                        backgroundColor: clickedRowIndex === rowIndex ? 'rgba(0, 0, 0, 0.07)' : '',
                                    }"
                                    :key="rowIndex"
                                    v-for="(item, rowIndex) in items"
                                    @click="emitRowClicked(item, rowIndex)"
                                >
                                    <td class="px-2"
                                        style="width: 1%;"
                                        :style="{ borderBottom: segmented && rowIndex === items.length - 1 ? '1px solid rgba(0,0,0,0.12)' : '' }"
                                        v-if="selectable"
                                    >
                                        <v-simple-checkbox
                                            style="transform: translateX(4px);"
                                            class="ma-0 pa-0"
                                            color="primary"
                                            :value="item.selected"
                                            v-ripple="false"
                                            @input="setSelectedItem(item)"
                                        ></v-simple-checkbox>
                                    </td>
                                    <td :key="colIndex"
                                        :style="{
                                            borderLeft: segmented ? '1px solid rgba(0,0,0,0.12)' : '',
                                            borderBottom: segmented && rowIndex === items.length - 1 ? '1px solid rgba(0,0,0,0.12)' : '',
                                        }"
                                        v-for="(column, colIndex) in orderedColumns"
                                        v-show="!column.hidden"
                                    >
                                        <slot :name="column.isRaw ? column.value : column.rawValue"
                                              :column="column"
                                              :column-index="colIndex"
                                              :item="item"
                                              :item-index="rowIndex"
                                        >
                                            <row-column-value
                                                :item="item"
                                                :column="column"
                                                :hyperlinks="!!meta.hyperlinks"
                                            ></row-column-value>
                                        </slot>
                                    </td>
                                    <td class="px-2"
                                        style="width: 1%;"
                                        :style="{
                                            borderLeft: segmented ? '1px solid rgba(0,0,0,0.12)' : '',
                                            borderBottom: segmented && rowIndex === items.length - 1 ? '1px solid rgba(0,0,0,0.12)' : ''
                                        }"
                                        v-show="items.length > 0 && actions.length > 0"
                                    >
                                        <div v-if="actions.length > 1">
                                            <v-menu bottom :nudge-bottom="32" :min-width="120">
                                                <template #activator="{ on, value }">
                                                    <v-btn icon small color="primary" v-on="on">
                                                        <v-icon small>{{ value ? 'mdi-dots-vertical-circle-outline' : 'mdi-dots-vertical' }}</v-icon>
                                                    </v-btn>
                                                </template>
                                                <v-card width="100%">
                                                    <div :key="index" v-for="(action, index) in actions">
                                                        <v-list-item
                                                            dense
                                                            :class="!!action.color ? `${action.color}--text` : 'black--text'"
                                                            :color="action.color || 'primary'"
                                                            :disabled="action.disabled || false"
                                                            v-if="!!action.show ? action.show(item) : true"
                                                            @click="action.confirmation ? confirmClosure(action, item) : action.closure(item)"
                                                        >
                                                            <v-list-item-content>
                                                                <v-list-item-title>{{ action.label }}</v-list-item-title>
                                                            </v-list-item-content>
                                                        </v-list-item>
                                                        <v-divider v-if="index < actions.length - 1"></v-divider>
                                                    </div>
                                                </v-card>
                                            </v-menu>
                                        </div>
                                        <div v-else-if="actions.length === 1">
                                            <v-btn text
                                                   small
                                                   :color="actions[0].color || 'primary'"
                                                   :disabled="actions[0].disabled || false"
                                                   v-if="!!actions[0] && actions[0].show ? actions[0].show(item) : true"
                                                   @click="actions[0].confirmation ? confirmClosure(actions[0], item) : actions[0].closure(item)"
                                            >{{ actions[0].label }}
                                            </v-btn>
                                        </div>
                                    </td>
                                </tr>
                                </tbody>
                            </template>
                        </v-simple-table>
                        <div style="position: absolute; top: 0; left: 0; width: 100%;"
                             :style="{height: `${page.innerHeight - 230}px`}"
                             v-if="items.length === 0"
                        >
                            <v-row no-gutters justify="center" align="center" class="fill-height">
                                <v-col cols="auto">
                                    <div>
                                        <v-row no-gutters justify="center">
                                            <v-col cols="auto">
                                                <v-img :width="150"
                                                       :src="`/icons/data-display-system/${hasFilters || hasSearch ? 'no_filter_items' : 'no_items'}.svg`"
                                                ></v-img>
                                            </v-col>
                                        </v-row>
                                    </div>
                                    <div class="text-center" v-if="hasFilters || hasSearch">
                                        <slot name="noItemsWithFilters">
                                            <div>Filters you have applied did not return any results.</div>
                                            <div>Please change or remove the filters completely.</div>
                                            <v-btn block
                                                   class="mt-4"
                                                   color="grey"
                                                   :disabled="loading"
                                                   :dark="!loading"
                                                   @click="applyClear()"
                                            >Clear Filters
                                            </v-btn>
                                        </slot>
                                    </div>
                                    <div class="text-center" v-else>
                                        <slot name="noItems">
                                            <div>This page does not have any data yet.</div>
                                            <div>Please check back soon!</div>
                                        </slot>
                                    </div>
                                </v-col>
                            </v-row>
                        </div>
                    </v-card>
                </v-col>
                <v-col cols="auto" style="transition: width 0.25s;" :style="{ width: additionalActionDrawer ? `${actionDrawerWidth}px` : '0px' }">
                    <action-drawer
                        :width="actionDrawerWidth"
                        :value="additionalActionDrawer"
                        :height="page.innerHeight - 230"
                        :actions="additionalActions"
                        :selected-items="returnObject ? Object.values(selectedMap) : Object.keys(selectedMap)"
                    >
                        <template #default>
                            <slot name="drawer"></slot>
                        </template>
                    </action-drawer>
                </v-col>
            </v-row>
        </div>
        <v-dialog persistent :max-width="600" v-model="actionClosure.show">
            <v-card v-if="actionClosure && actionClosure.action">
                <v-card-text class="pb-4 px-4 pt-3">
                    <div class="title mb-3 black--text">
                        {{ confirmAction.title }}
                    </div>
                    <div>
                        {{ confirmAction.text }}
                    </div>
                </v-card-text>
                <v-card-actions class="pb-4 px-4">
                    <v-spacer></v-spacer>
                    <v-btn text
                           :color="confirmAction.buttons.cancel.color"
                           dark
                           @click="closeActionClosure()"
                    >{{ confirmAction.buttons.cancel.text }}
                    </v-btn>
                    <v-btn text
                           :color="confirmAction.buttons.confirm.color"
                           @click="closure()"
                    >{{ confirmAction.buttons.confirm.text }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import {debounce} from "./helpers/helpers";
    import HeaderFilterSection from "./components/HeaderFilterSection";
    import RowColumnValue from "./components/RowColumnValue";
    import SearchMenu from "./components/SearchMenu";
    import FilterMenu from "./components/FilterMenu";
    import ActionDrawer from "./components/ActionDrawer";

    export default {
        name: "DataGrid",
        components: {
            HeaderFilterSection,
            RowColumnValue,
            SearchMenu,
            FilterMenu,
            ActionDrawer,
        },
        props: {
            value: {
                type: Array,
                default: () => [],
            },
            data: {
                type: Object,
                required: true,
            },
            actions: {
                type: Array,
                default: () => [],
            },
            additionalActions: {
                type: Array,
                default: () => [],
            },
            selectable: {
                type: Boolean,
                default: false,
            },
            itemValue: {
                type: String | null,
                default: null,
            },
            returnObject: {
                type: Boolean,
                default: false,
            },
            hideAdditionalActions: {
                type: Boolean,
                default: false,
            },
            actionDrawerWidth: {
                type: Number | String,
                default: 266,
            },
            segmented: {
                type: Boolean,
                default: false,
            },
        },
        computed: {
            items() {
                return this.data.items;
            },
            meta() {
                return this.data.metaData;
            },
            orderedColumns() {
                return this.meta.columns.sort((a, b) => (a.index > b.index) ? 1 : ((b.index > a.index) ? -1 : 0));
            },
            hasSearch() {
                return (!!this.meta.search && !!this.afterPostQueries && Object.keys(this.afterPostQueries).length > 0);
            },
            hasFilters() {
                return (Object.keys(this.meta.filters).length > 0);
            },
            hasLayout() {
                return this.meta.layouts.findIndex(({current}) => current) !== -1;
            },
            selectedItems() {
                return this.items.filter(({selected}) => selected);
            },
            advancedColumns() {
                return this.meta.columns.filter(({isAdvanced, hidden, iconMap}) => (isAdvanced && !hidden) || iconMap.length > 0);
            },
            currentSearches() {
                return Object.values(this.afterPostQueries).reduce((carry, terms) => carry.concat(terms), []);
            },
            totalCurrentSearches() {
                return this.currentSearches.length;
            },
            totalCurrentFilters() {
                return Object.keys(this.meta.filters).length;
            },
            confirmAction() {
                if (!!this.actionClosure && !!this.actionClosure.action && !!this.actionClosure.action.confirmation) {
                    if (typeof this.actionClosure.action.confirmation !== 'string') {
                        const buttons = this.actionClosure.action.confirmation.buttons;

                        return {
                            title: this.actionClosure.action.confirmation.title || 'Confirm',
                            text: this.actionClosure.action.confirmation.text || 'Are you sure you\'d like perform this action?',
                            buttons: {
                                cancel: {
                                    text: !!buttons.cancel ? buttons.cancel.text : 'Cancel',
                                    color: !!buttons.cancel ? buttons.cancel.color : 'black',
                                },
                                confirm: {
                                    text: !!buttons.confirm ? buttons.confirm.text : 'Confirm',
                                    color: !!buttons.confirm ? buttons.confirm.color : 'primary',
                                },
                            },
                        };
                    } else {
                        return {
                            title: 'Confirm',
                            text: this.actionClosure.action.confirmation,
                            buttons: {
                                cancel: {
                                    text: 'Cancel',
                                    color: 'black',
                                },
                                confirm: {
                                    text: 'Confirm',
                                    color: 'error',
                                },
                            },
                        };
                    }
                }

                return {};
            },
        },
        watch: {
            selectedMap(val) {
                if (this.selectable) {
                    if (!this.itemValue) {
                        console.error('Prop "item-value" is required when using selectable.');
                    } else {
                        if (!this.returnObject) {
                            this.$emit('input', val[this.itemValue]);
                        } else {
                            this.$emit('input', val);
                        }
                    }
                }
            },
            additionalActionDrawer(val) {
                if (val) {
                    this.$emit('drawerOpened', this.selectedItems);
                } else {
                    this.$emit('drawerClosed');
                }
            },
        },
        data() {
            return {
                debouncedInitialSearch: null,
                debouncedPaginate: null,
                page: {
                    innerWidth: 0,
                    innerHeight: 0,
                },
                menus: {
                    search: false,
                    filter: false,
                },
                additionalActionDrawer: false,
                loading: false,
                actionClosure: {
                    show: false,
                    item: null,
                    action: null,
                },
                afterPostQueries: {},
                selectedMap: {},
                clickedRowIndex: null,
            };
        },
        methods: {
            registerEvents() {
                window.addEventListener('resize', debounce(this.setPageSizes, 500));
            },
            destroyEvents() {
                window.removeEventListener('resize', this.setPageSizes);
            },
            setPageSizes() {
                this.page.innerWidth = window.innerWidth;
                this.page.innerHeight = window.innerHeight;
            },
            setSelectedItem(item) {
                this.$set(item, 'selected', !item.selected);
                this.$set(this.selectedMap, item[this.itemValue], item);
            },
            selectAllItems() {
                if (this.selectedItems.length === this.items.length) {
                    this.items.forEach((item) => {
                        this.$set(item, 'selected', false);
                    });
                    this.selectedMap = {};
                } else {
                    this.items.forEach((item) => {
                        this.$set(item, 'selected', true);
                        this.$set(this.selectedMap, item[this.itemValue], item);
                    });
                }
            },
            setActiveItems() {
                this.items.map((item) => {
                    this.$set(item, 'selected', !!this.selectedMap[item[this.itemValue]]);
                });
            },
            updateMeta(key, value) {
                this.$set(this.data.metaData, key, value);
            },
            updateMetaSubValue(key, subKey, value) {
                this.$set(this.data.metaData[key], subKey, value);
            },
            searchQueriesFromArrayToObject() {
                if (Array.isArray(this.meta.search.queries)) {
                    this.updateMetaSubValue('search', 'queries', {});
                }
            },
            termsString(query) {
                return query.reduce((carry, term, index) => index === 0 ? carry + term : carry + `, ${term}`, '');
            },
            getColumnLabel(query) {
                const column = this.meta.columns.find((column) => {
                    const value = column['isRaw'] ? column['value'] : column['rawValue'];

                    return value === query;
                });

                if (column) {
                    return column.label;
                } else {
                    const column = this.meta.columns.find((column) => {
                        return query.split('.')[1] === column['subtitle'];
                    });

                    if (column) {
                        return `${column.label} subtitle`;
                    }
                }

                return '';
            },
            applyInitialSearch() {
                this.updateMetaSubValue('search', 'initial', true);
                this.searchQueriesFromArrayToObject();

                if (this.meta.states.search === 'route') {
                    this.post();
                } else {
                    this.postChanges('search', {search: this.meta.search});
                }
            },
            clearSearch() {
                this.updateMetaSubValue('search', 'initial', true);
                this.updateMetaSubValue('search', 'queries', {});
                this.updateMetaSubValue('search', 'term', '');

                if (this.meta.states.search === 'route') {
                    this.post();
                } else {
                    this.postChanges('search', {search: this.meta.search}, true);
                }
            },
            clearSearchQuery(query) {
                this.$delete(this.data.metaData.search.queries, query);

                if (this.meta.states.search === 'route') {
                    this.post();
                } else {
                    this.postChanges('search', {search: this.meta.search}, true);
                }
            },
            applySearch(queries) {
                this.updateMetaSubValue('search', 'initial', false);
                this.updateMetaSubValue('search', 'queries', queries);

                if (this.meta.states.search === 'route') {
                    this.post();
                } else {
                    this.postChanges('search', {search: this.meta.search});
                }
            },
            clearFilters() {
                this.loading = true;
                this.updateMeta('filters', {});
                this.postChanges('filters', {filters: {}});
            },
            applyFilters(filters) {
                this.loading = true;
                this.updateMeta('filters', filters)
                this.postChanges('filters', {filters: filters});
            },
            applyLayout(layout) {
                this.loading = true;
                this.postChanges('layout', {layout: layout, sort: this.meta.sortBy}, false, false);
            },
            addLayout(layout) {
                this.loading = true;
                this.postChanges('add', {layout: layout, sort: this.meta.sortBy}, false, false);
            },
            removeLayout(layout) {
                this.loading = true;
                this.postChanges('remove', {layout: layout}, false, false);
            },
            pageUp() {
                this.updateMeta('page', ++this.meta.page);
                this.debouncedPaginate();
            },
            pageDown() {
                this.updateMeta('page', --this.meta.page);
                this.debouncedPaginate();
            },
            goToPage(page) {
                this.updateMeta('page', page);
                this.paginate();
            },
            paginate() {
                if (this.meta.states.page === 'route') {
                    this.post();
                } else {
                    this.postChanges('page', {page: this.meta.page});
                }
            },
            applySortBy(value) {
                this.loading = true;
                this.updateMeta('sortBy', value);

                if (this.meta.states.sort === 'route') {
                    this.post();
                } else {
                    this.postChanges('sort', {sortBy: this.meta.sortBy});
                }
            },
            changeSortDirection(column) {
                const order = this.meta.sortBy[column.value] === 'asc' ? 'desc' : 'asc';
                this.updateMetaSubValue('sortBy', column.value, order);

                if (this.meta.states.sort === 'route') {
                    this.post();
                } else {
                    this.postChanges('sort', {sortBy: this.meta.sortBy});
                }
            },
            applyView(columns) {
                this.loading = true;
                this.updateMeta('columns', columns);
                this.postChanges('view', {columns: columns}, false, false);
            },
            applyClear() {
                this.loading = true;
                this.post(true);
            },
            afterPromise(clear = false) {
                this.searchQueriesFromArrayToObject();
                this.closeFilterMenu();
                this.afterPostQueries = JSON.parse(JSON.stringify(this.meta.search.queries));
                if (this.meta.search && !!this.meta.search.term && this.meta.search.initial) {
                    this.openSearchMenu();
                } else {
                    this.closeSearchMenu();
                }

                if (clear) {
                    this.updateMeta('filters', {});
                    this.postChanges('filters', {filters: {}});
                }

                this.loading = false;
            },
            getPostDataBasedOnStates() {
                let data = {};

                if (this.meta.states.search === 'route') {
                    this.$set(data, 'search', {
                        initial: this.meta.search.initial,
                        term: this.meta.search.term,
                        queries: this.meta.search.queries,
                    });
                }

                if (this.meta.states.sort === 'route') {
                    this.$set(data, 'sortBy', this.meta.sortBy);
                }

                if (this.meta.states.page === 'route') {
                    this.$set(data, 'page', this.meta.page);
                }

                return data;
            },
            post(clear = false) {
                const data = this.getPostDataBasedOnStates(),
                    btoa = Buffer.from(JSON.stringify(data), 'utf8').toString('base64');

                let payload = {};
                if (!clear) {
                    payload = {q: btoa};
                } else {
                    payload = {q: {}};
                }

                this.$inertia.reload({
                    data: payload,
                    // preserveState: false,
                    preserveScroll: true,
                    onSuccess: () => {
                        this.setActiveItems();
                        this.afterPromise(clear);
                    },
                });
            },
            postChanges(action, data = {}, clear = false, preserve = true) {
                this.$inertia.post(
                    this.$route(`datagrid.${action}`, [this.meta.tableRef]),
                    data,
                    {
                        preserveScroll: true,
                        preserveState: preserve,
                        onSuccess: () => {
                            this.setActiveItems();
                            this.afterPromise(clear);
                        },
                    }
                );
            },
            openSearchMenu() {
                this.menus.search = true;
            },
            closeSearchMenu() {
                this.menus.search = false;
            },
            closeFilterMenu() {
                this.menus.filter = false;
            },
            confirmClosure(action, item) {
                this.actionClosure.action = action;
                this.actionClosure.item = item;
                setTimeout(() => {
                    this.actionClosure.show = true;
                }, 0);
            },
            closeActionClosure() {
                this.actionClosure = {
                    show: false,
                    item: null,
                    action: null,
                };
            },
            closure() {
                this.actionClosure.action.closure(this.actionClosure.item);
                this.actionClosure.show = false;

                setTimeout(() => {
                    this.actionClosure = {
                        show: false,
                        item: null,
                        action: null,
                    };
                }, 250);
            },
            emitRowClicked(item, index) {
                this.$emit('click:row', item);
                this.clickedRowIndex = index;
            },
        },
        mounted() {
            this.setPageSizes();
        },
        beforeMount() {
            this.registerEvents();
            this.afterPostQueries = JSON.parse(JSON.stringify(this.meta.search.queries));
        },
        created() {
            this.debouncedPaginate = debounce(this.paginate, 250);
            this.debouncedInitialSearch = debounce(this.applyInitialSearch, 500);
        },
        beforeDestroy() {
            this.destroyEvents();
        },
    }
</script>

<style scoped>
    .hide-scrollbar::-webkit-scrollbar {
        display: none;
    }

    .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }

    .clicked {
        transition: background-color 0.05s;
    }

    .clicked:active {
        background-color: rgba(0, 0, 0, 0.05) !important;
    }
</style>
