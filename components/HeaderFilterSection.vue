<template>
    <v-row no-gutters justify="end" align="center" class="fill-height">
        <v-col cols="auto" v-if="metaData.layouts.length > 0">
            <div class="px-1">
                <header-filter-action
                    icon="mdi-table-edit"
                    :icon-color="!hasLayout ? 'grey' : 'secondary'"
                    v-model="layoutMenu"
                >{{ hasLayout ? currentLayout.label : 'Views' }}
                    <template #menu>
                        <view-menu-content
                            :layouts="metaData.layouts"
                            @layout="emitLayout($event)"
                            @add="emitLayoutAdd($event)"
                            @remove="emitLayoutRemove($event)"
                        ></view-menu-content>
                    </template>
                </header-filter-action>
            </div>
        </v-col>
        <v-col cols="auto">
            <div class="px-1">
                <header-filter-action
                    icon="mdi-sort"
                    :icon-color="!hasSortBy ? 'grey' : 'secondary'"
                    v-model="sortByMenu"
                >Sort
                    <template #menu>
                        <sort-menu-content
                            :columns="metaData.columns"
                            :sort-by="metaData.sortBy"
                            v-model="sortByMenu"
                            @sort="emitSortBy($event)"
                        ></sort-menu-content>
                    </template>
                </header-filter-action>
            </div>
        </v-col>
        <v-col cols="auto">
            <div class="px-1">
                <header-filter-action icon="mdi-view-column-outline" :icon-color="currentLayoutIsCustom ? 'secondary' : 'grey'" v-model="viewMenu">
                    Columns
                    <template #menu>
                        <column-menu-content
                            :columns="metaData.columns"
                            @view="emitColumnChanges($event)"
                        ></column-menu-content>
                    </template>
                </header-filter-action>
            </div>
        </v-col>
        <v-col cols="auto">
            <div class="px-1">
                <header-filter-action style="line-height: 1.1;" icon="mdi-format-list-bulleted-square" :hide-action="metaData.totalPages <= 1">
                    <div class="text-center">{{ paginationText }}</div>
                    <div class="text-center"><small>of {{ metaData.totalItems }}</small></div>
                    <template #action>
                        <v-row no-gutters align="center" class="fill-height">
                            <v-col cols="auto">
                                <v-btn small icon :disabled="metaData.page === 1" @click="emitPageDown()">
                                    <v-icon>mdi-chevron-left</v-icon>
                                </v-btn>
                            </v-col>
                            <v-col cols="auto" class="pl-1">
                                <v-btn small icon :disabled="metaData.page === metaData.totalPages" @click="emitPageUp()">
                                    <v-icon>mdi-chevron-right</v-icon>
                                </v-btn>
                            </v-col>
                        </v-row>
                    </template>
                </header-filter-action>
            </div>
        </v-col>
        <v-col cols="auto">
            <div :class="metaData.totalPages > 1 ? 'px-1' : ''">
                <v-expand-x-transition>
                    <header-filter-action
                        style="line-height: 1.1;"
                        icon="mdi-note-multiple-outline"
                        v-model="pageToMenu"
                        v-if="metaData.totalPages > 1"
                    >
                        <div class="text-center">Page {{ metaData.page }}</div>
                        <div class="text-center"><small>of {{ metaData.totalPages }}</small></div>
                        <template #menu>
                            <page-menu-content
                                :total-pages="metaData.totalPages"
                                @go="emitGoToPage($event)"
                            ></page-menu-content>
                        </template>
                    </header-filter-action>
                </v-expand-x-transition>
            </div>
        </v-col>
    </v-row>
</template>

<script>
    import HeaderFilterAction from "./HeaderFilterAction";
    import SortMenuContent from "./SortMenuContent";
    import ColumnMenuContent from "./ColumnMenuContent";
    import PageMenuContent from "./PageMenuContent";
    import ViewMenuContent from "./ViewMenuContent";

    export default {
        name: "HeaderFilterSection",
        components: {
            HeaderFilterAction,
            ViewMenuContent,
            SortMenuContent,
            ColumnMenuContent,
            PageMenuContent,
        },
        props: {
            metaData: {
                type: Object,
                required: true,
            },
            currentTotalItems: {
                type: Number,
                required: true,
            },
        },
        computed: {
            currentLayout() {
                return this.metaData.layouts.find(({current}) => current);
            },
            hasLayout() {
                return !!this.currentLayout;
            },
            hasSortBy() {
                return Object.keys(this.metaData.sortBy).length > 0;
            },
            itemsPerPage() {
                if (this.currentTotalItems <= this.metaData.itemsPerPage) {
                    return this.currentTotalItems;
                }

                return this.metaData.itemsPerPage;
            },
            paginationText() {
                if (this.metaData.page > 1) {
                    return `${((this.metaData.page - 1) * this.metaData.itemsPerPage) + 1}-${(this.metaData.itemsPerPage * this.metaData.page) < this.metaData.totalItems ? this.metaData.itemsPerPage * this.metaData.page : this.metaData.totalItems}`;
                } else {
                    return `${this.metaData.page}-${this.metaData.itemsPerPage < this.metaData.totalItems ? this.metaData.itemsPerPage : this.metaData.totalItems}`;
                }
            },
            currentLayoutIsCustom() {
                const layout = this.metaData.layouts.find(({current}) => current);

                return !!layout && layout.label === 'Custom Layout';
            },
        },
        data() {
            return {
                layoutMenu: false,
                sortByMenu: false,
                viewMenu: false,
                pageToMenu: false,
            };
        },
        methods: {
            emitLayout(layout) {
                this.$emit('layout', layout);
            },
            emitLayoutAdd(layout) {
                layout['columns'] = this.metaData.columns.map((column) => {
                    const value = column.isRaw ? column.value : column.rawValue;
                    return {
                        value: value,
                        order: column.index,
                        hidden: column.hidden,
                    };
                });

                this.$emit('addLayout', layout);
            },
            emitLayoutRemove(layout) {
                this.$emit('removeLayout', layout);
            },
            emitPageDown() {
                this.$emit('pageDown');
            },
            emitPageUp() {
                this.$emit('pageUp');
            },
            emitSortBy(value) {
                this.$emit('sort', value);
                this.sortByMenu = false;
            },
            emitColumnChanges(columns) {
                this.viewMenu = false;
                this.$emit('view', columns);
            },
            emitGoToPage(page) {
                this.$emit('goToPage', page);
                this.pageToMenu = false;
            },
        },
    }
</script>

<style scoped>

</style>
