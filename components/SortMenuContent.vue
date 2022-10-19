<template>
    <div style="width: 200px;">
        <div class="subtitle-2 mb-1">Sort By</div>
        <v-list-item
            dense
            class="px-3 list-item-outlined"
            :class="index < columns.length - 1 ? 'mb-3' : ''"
            :key="`${column.value}_${index}`"
            :disabled="column.hidden"
            v-for="(column, index) in columns"
        >
            <v-list-item-content class="py-1">
                <v-badge inline color="grey" dark :value="sortIndex(column) !== -1" :content="sortIndex(column)">
                    <v-list-item-title>
                        {{ column.label }}
                    </v-list-item-title>
                    <template #badge>
                        {{ sortIndex(column) + 1 }}
                    </template>
                </v-badge>
            </v-list-item-content>
            <v-list-item-action class="ml-4 my-0">
                <v-row dense justify="end" align="center" class="fill-height">
                    <v-col cols="auto">
                        <v-btn icon
                               outlined
                               x-small
                               :class="sortOptionSelected(column.rawValue) ? 'primary' : ''"
                               :dark="sortOptionSelected(column.rawValue)"
                               @click="setSortOptions(column.rawValue)"
                        >
                            <v-icon>mdi-arrow-up</v-icon>
                        </v-btn>
                    </v-col>
                    <v-col cols="auto">
                        <v-btn icon
                               outlined
                               x-small
                               :class="sortOptionSelected(column.rawValue, 'desc') ? 'primary' : ''"
                               :dark="sortOptionSelected(column.rawValue, 'desc')"
                               @click="setSortOptions(column.rawValue, 'desc')"
                        >
                            <v-icon>mdi-arrow-down</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
            </v-list-item-action>
        </v-list-item>
        <v-row no-gutters class="mt-4">
            <v-col cols="6" class="pr-2">
                <v-btn block
                       small
                       dark
                       color="grey"
                       @click="clearSortBy()"
                >Clear
                </v-btn>
            </v-col>
            <v-col cols="6" class="pl-2">
                <v-btn block
                       small
                       color="primary"
                       @click="emitSortBy()"
                >Apply
                </v-btn>
            </v-col>
        </v-row>
    </div>
</template>

<script>
    export default {
        name: "SortMenuContent",
        props: {
            columns: {
                type: Array,
                required: true,
            },
            sortBy: {
                type: Object | Array,
                required: true,
            },
        },
        data() {
            return {
                innerSortBy: {},
            };
        },
        methods: {
            cloneInner() {
                if (Object.keys(this.sortBy).length !== 0) {
                    this.innerSortBy = JSON.parse(JSON.stringify(this.sortBy));
                } else {
                    this.innerSortBy = {};
                }
            },
            sortIndex(column) {
                return Object.keys(this.innerSortBy).findIndex((key) => key === column.rawValue);
            },
            setSortOptions(value, direction = 'asc') {
                if (this.innerSortBy[value]) {
                    if (direction === this.innerSortBy[value]) {
                        this.$delete(this.innerSortBy, value);
                    } else {
                        this.$set(this.innerSortBy, value, direction);
                    }
                } else {
                    this.$set(this.innerSortBy, value, direction);
                }
            },
            sortOptionSelected(value, direction = 'asc') {
                return !!this.innerSortBy[value] && this.innerSortBy[value] === direction;
            },
            emitSortBy() {
                this.emitValue(this.innerSortBy);
            },
            clearSortBy() {
                this.innerSortBy = {};
                this.emitValue(this.innerSortBy);
            },
            emitValue(value) {
                this.$emit('sort', value);
            },
        },
        mounted() {
            this.cloneInner();
        },
    }
</script>

<style scoped>
    .list-item-outlined {
        border: 1px solid lightgray;
        border-radius: 5px;
    }
</style>
