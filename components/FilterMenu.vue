<template>
    <div>
        <div class="pa-4">
            <v-alert dense text outlined color="grey" type="info" v-if="hasLayout">
                Some filters are hidden due to an active layout.
            </v-alert>
            <div class="mb-2 font-weight-bold black--text">Filters</div>
            <table style="width: 100%;">
                <tr :key="index" v-for="(column, index) in advancedColumns">
                    <td class="py-2">
                        <div class="subtitle-2" style="white-space: nowrap;">{{ column.label }}{{ !!column.iconConditionRawValue ? ' (icon)' : '' }}</div>
                    </td>
                    <td class="py-2 pl-3">
                        <div v-if="column.type === 'enum'">
                            <v-autocomplete
                                dense
                                outlined
                                label="Value"
                                hide-details
                                clearable
                                :items="getEnumValues(column.enumerators)"
                                :value="!!filters[column.rawValue] ? filters[column.rawValue].value : null"
                                @input="selectEnum(column.rawValue, $event)"
                                @click:clear="clearEnum(column.rawValue)"
                            ></v-autocomplete>
                        </div>
                        <div v-else-if="column.type === 'number' || column.type === 'perc'">
                            <v-row dense class="flex-nowrap">
                                <v-col cols="4">
                                    <v-autocomplete
                                        dense
                                        outlined
                                        label="Operator"
                                        hide-details
                                        :items="numberOperators"
                                        :value="!!filters[column.rawValue] ? filters[column.rawValue].operator : null"
                                        @input="selectOperator(column.rawValue, $event)"
                                    ></v-autocomplete>
                                </v-col>
                                <v-col cols="8">
                                    <v-text-field
                                        hide-spin-buttons
                                        prepend-inner-icon="mdi-counter"
                                        hide-details
                                        dense
                                        outlined
                                        clearable
                                        type="number"
                                        :value="!!filters[column.rawValue] ? filters[column.rawValue].value : null"
                                        :label="column.type === 'number' ? 'Value' : 'Percentage'"
                                        :disabled="!filters[column.rawValue] || !filters[column.rawValue].operator"
                                        @input="selectNumber(column.rawValue, $event, column.type)"
                                        @click:clear="clearOperator(column.rawValue)"
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                        </div>
                        <div v-else-if="column.type === 'timestamp'">
                            <v-row dense class="flex-nowrap">
                                <v-col cols="4">
                                    <v-autocomplete
                                        dense
                                        outlined
                                        label="Operator"
                                        hide-details
                                        :items="timestampOperators"
                                        :value="!!filters[column.rawValue] ? filters[column.rawValue].operator : null"
                                        @input="selectOperator(column.rawValue, $event)"
                                    ></v-autocomplete>
                                </v-col>
                                <v-col cols="8">
                                    <v-menu
                                        transition="scale-transition"
                                        offset-y
                                        min-width="auto"
                                        :close-on-content-click="false"
                                        v-model="pickers[column.rawValue]"
                                    >
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-text-field
                                                label="Date"
                                                prepend-inner-icon="mdi-calendar"
                                                readonly
                                                hide-details
                                                dense
                                                outlined
                                                clearable
                                                :disabled="!filters[column.rawValue] || !filters[column.rawValue].operator"
                                                :value="getFormattedTimestampValue(column.rawValue)"
                                                v-bind="attrs"
                                                v-on="on"
                                                @click:clear="clearOperator(column.rawValue)"
                                            ></v-text-field>
                                        </template>
                                        <v-date-picker
                                            color="primary"
                                            :value="!!filters[column.rawValue] ? filters[column.rawValue].value : null"
                                            @input="selectTimestamp(column.rawValue, $event)"
                                        ></v-date-picker>
                                    </v-menu>
                                </v-col>
                            </v-row>
                        </div>
                        <div v-else-if="column.type === 'icon' || (!!column.iconConditionRawValue)">
                            <v-menu bottom :max-width="50" :nudge-right="46">
                                <template #activator="{ on }">
                                    <v-row no-gutters align="center" class="flex-nowrap">
                                        <v-col cols="auto">
                                            <div class="rounded"
                                                 style="border: 1px solid rgba(0,0,0,0.4); width: 40px; height: 40px; cursor: pointer; padding: 6px;"
                                                 v-ripple v-on="on"
                                            >
                                                <v-icon :color="getSelectedIcon(column).color" v-if="!!getSelectedIcon(column)">
                                                    {{ composeIcon(getSelectedIcon(column).icon) }}
                                                </v-icon>
                                            </div>
                                        </v-col>
                                        <v-col cols="auto" class="pl-1">
                                            <v-scroll-x-transition hide-on-leave>
                                                <v-btn small icon v-if="!!getSelectedIcon(column)" @click="clearIcon(column)">
                                                    <v-icon>mdi-close</v-icon>
                                                </v-btn>
                                            </v-scroll-x-transition>
                                        </v-col>
                                    </v-row>
                                </template>
                                <v-card :width="50">
                                    <div :key="index" v-for="(icon, index) in getFilteredIconMap(column.iconMap)" @click="selectIcon(column, icon)">
                                        <v-hover>
                                            <template #default="{ hover }">
                                                <div class="pa-3" style="cursor: pointer;" :class="hover ? 'grey lighten-3' : ''">
                                                    <v-icon :color="icon.color">{{ composeIcon(icon.icon) }}</v-icon>
                                                </div>
                                            </template>
                                        </v-hover>
                                    </div>
                                </v-card>
                            </v-menu>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
        <v-divider></v-divider>
        <v-card-actions class="px-4 py-3">
            <v-spacer></v-spacer>
            <v-btn small
                   dark
                   color="grey"
                   @click="clearFilters()"
            >Clear
            </v-btn>
            <v-btn small
                   color="primary"
                   @click="emitFilters()"
            >Apply
            </v-btn>
        </v-card-actions>
    </div>
</template>

<script>
    import filters from "../helpers/filters";

    export default {
        name: "FilterMenu",
        mixins: [filters],
        props: {
            data: {
                type: Object | Array,
                required: true,
            },
            columns: {
                type: Array,
                required: true,
            },
            hasLayout: {
                type: Boolean,
                default: false,
            },
        },
        computed: {
            advancedColumns() {
                return this.columns.filter(({isAdvanced, hidden}) => isAdvanced && !hidden).concat(this.extraColumns);
            },
            extraColumns() {
                return this.columns.filter(({iconConditionRawValue}) => !!iconConditionRawValue);
            },
        },
        data() {
            return {
                filters: {},
                timestampOperators: [
                    {value: '<', text: 'Before'},
                    {value: '=', text: 'Equal'},
                    {value: '>', text: 'After'},
                ],
                numberOperators: [
                    {value: '<', text: 'Less'},
                    {value: '=', text: 'Equal'},
                    {value: '>', text: 'Greater'},
                ],
                pickers: {},
                clearing: false,
            };
        },
        methods: {
            getFilteredIconMap(iconMap) {
                return iconMap.filter(({operator}) => operator !== null);
            },
            initFilters(withPickers = true) {
                this.advancedColumns.forEach((column) => {
                    if (column.type === 'icon') {
                        this.$set(this.filters, `${column.rawValue}_icon`, {});
                    } else if (column.type !== 'icon') {
                        if (!column.iconConditionRawValue) {
                            this.$set(this.filters, column.rawValue, {});
                        } else {
                            this.$set(this.filters, `${column.iconConditionRawValue}_icon`, {});
                        }
                    }

                    if (withPickers) {
                        this.$set(this.pickers, column.rawValue, false);
                        this.$set(this.pickers, column.rawValue, false);
                    }
                });
            },
            setExistingFilters() {
                const keys = Object.keys(this.data);

                if (keys.length > 0) {
                    keys.forEach((key) => {
                        if (!!this.data[key].value || !!this.data[key].operator || !!this.data[key].type) {
                            this.setFilter(key, this.data[key].value, this.data[key].operator, this.data[key].type);
                        } else {
                            this.$set(this.filters, key, {});
                        }
                    });
                }
            },
            getEnumValues(items) {
                return Object.keys(items).map((key) => {
                    return {
                        value: key, text: items[key]
                    };
                });
            },
            getFormattedTimestampValue(value) {
                if (!this.filters[value] || !this.filters[value]['value']) {
                    return null;
                } else {
                    return this.$options.filters.humanDate(this.filters[value]['value'], 'D MMMM YYYY');
                }
            },
            getSelectedIcon(column) {
                let icons = column.iconMap,
                    filter = this.filters[`${column.rawValue}_icon`];

                if (!filter && !!column.iconConditionRawValue) {
                    filter = this.filters[`${column.iconConditionRawValue}_icon`];
                }

                return icons.find(({value, operator}) => filter.value === value && filter.operator === operator);
            },
            composeIcon(icon) {
                return icon.includes('mdi-') ? icon : `mdi-${icon}`;
            },
            selectIcon(column, icon) {
                const value = !column.iconConditionRawValue ? column.rawValue : column.iconConditionRawValue;
                this.setFilter(`${value}_icon`, icon.value, icon.operator, 'icon');
            },
            selectOperator(value, operator) {
                this.setFilter(value, null, operator, 'timestamp');
            },
            selectNumber(value, number, type) {
                this.setFilter(value, number, this.filters[value].operator, type);
            },
            selectTimestamp(value, timestamp) {
                this.setFilter(value, timestamp, this.filters[value].operator, 'timestamp');
                this.pickers[value] = false;
            },
            selectEnum(value, item) {
                if (!this.clearing) {
                    this.setFilter(value, item, '=', 'enum');
                }

                this.clearing = false;
            },
            setFilter(key, value, operator, type) {
                this.$set(this.filters[key], 'value', value);
                this.$set(this.filters[key], 'operator', operator);
                this.$set(this.filters[key], 'type', type);
            },
            clearEnum(value) {
                this.clearing = true;
                this.$set(this.filters, value, {});
            },
            clearOperator(value) {
                this.$set(this.filters[value], 'operator', null);
            },
            clearIcon(column) {
                const value = !column.iconConditionRawValue ? column.rawValue : column.iconConditionRawValue;
                this.$set(this.filters, `${value}_icon`, {});
            },
            clearFilters() {
                this.initFilters(false);
                this.$emit('clear');
            },
            emitFilters() {
                this.$emit('filters', this.filters);
            },
        },
        beforeMount() {
            this.initFilters();
            this.setExistingFilters();
        },
    }
</script>

<style scoped>

</style>
