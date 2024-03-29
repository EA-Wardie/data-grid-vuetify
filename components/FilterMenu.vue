<template>
    <div>
        <div class="pa-4">
            <div class="mb-2 font-weight-bold black--text">Filters</div>
            <table style="width: 100%;">
                <tr :key="index" v-for="(column, index) in advancedColumns">
                    <td class="py-2">
                        <div class="subtitle-2"
                             style="max-width: 170px; word-break: break-word; line-height: 1.1;"
                             v-if="!column.iconConditionRawValue"
                        >{{ column.label }}
                        </div>
                        <div class="subtitle-2"
                             style="max-width: 170px; word-break: break-word; line-height: 1.1;"
                             v-else
                        >{{ !!column.iconMap[0] && column.iconMap[0].label ? column.iconMap[0].label : `${column.label} (I)` }}
                        </div>
                    </td>
                    <td class="py-2 pl-3">
                        <v-row no-gutters justify="end">
                            <v-col cols="auto">
                                <div v-if="column.type === 'enum'">
                                    <v-autocomplete
                                        dense
                                        outlined
                                        label="Value"
                                        hide-details
                                        clearable
                                        no-data-text="No Items"
                                        :items="getEnumValues(column.enumerators)"
                                        :value="!!filters[getColumnValue(column)] ? filters[getColumnValue(column)].value : null"
                                        @input="selectEnum(getColumnValue(column), $event)"
                                        @click:clear="clearEnum(getColumnValue(column))"
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
                                                no-data-text="No Items"
                                                :items="numberOperators"
                                                :value="!!filters[getColumnValue(column)] ? filters[getColumnValue(column)].operator : null"
                                                @input="selectOperator(getColumnValue(column), $event)"
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
                                                :value="!!filters[getColumnValue(column)] ? filters[getColumnValue(column)].value : null"
                                                :label="column.type === 'number' ? 'Value' : 'Percentage'"
                                                :disabled="!filters[getColumnValue(column)] || !filters[getColumnValue(column)].operator"
                                                @input="selectNumber(getColumnValue(column), $event)"
                                                @click:clear="clearOperator(getColumnValue(column))"
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
                                                no-data-text="No Items"
                                                :items="timestampOperators"
                                                :value="!!filters[getColumnValue(column)] ? filters[getColumnValue(column)].operator : null"
                                                @input="selectOperator(getColumnValue(column), $event)"
                                            ></v-autocomplete>
                                        </v-col>
                                        <v-col cols="8">
                                            <v-menu
                                                transition="scale-transition"
                                                offset-y
                                                min-width="auto"
                                                :close-on-content-click="false"
                                                v-model="pickers[getColumnValue(column)]"
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
                                                        :disabled="!filters[getColumnValue(column)] || !filters[getColumnValue(column)].operator"
                                                        :value="getFormattedTimestampValue(getColumnValue(column))"
                                                        v-bind="attrs"
                                                        v-on="on"
                                                        @click:clear="clearOperator(getColumnValue(column))"
                                                    ></v-text-field>
                                                </template>
                                                <v-date-picker
                                                    color="primary"
                                                    :value="!!filters[getColumnValue(column)] ? filters[getColumnValue(column)].value : null"
                                                    @input="selectTimestamp(getColumnValue(column), $event)"
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
                                                    <v-expand-x-transition>
                                                        <div class="mr-3" style="height: 24px; white-space: nowrap;"
                                                             v-if="!!getSelectedIcon(column) && !!getSelectedIcon(column).tooltip"
                                                        >{{ getSelectedIcon(column).tooltip }}
                                                        </div>
                                                    </v-expand-x-transition>
                                                </v-col>
                                                <v-col cols="auto">
                                                    <v-card
                                                        flat
                                                        class="rounded"
                                                        style="border: 1px solid rgba(0,0,0,0.4); width: 40px; height: 40px; cursor: pointer;"
                                                        v-ripple
                                                        v-on="on"
                                                    >
                                                        <v-row no-gutters justify="center" align="center" class="fill-height">
                                                            <v-col cols="auto">
                                                                <v-icon :color="getSelectedIcon(column).color" v-if="!!getSelectedIcon(column)">
                                                                    {{ composeIcon(getSelectedIcon(column).icon) }}
                                                                </v-icon>
                                                            </v-col>
                                                        </v-row>
                                                    </v-card>
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
                                                        <div :class="hover ? 'grey lighten-3' : ''">
                                                            <v-tooltip right :disabled="!icon.tooltip">
                                                                <template #activator="{ on }">
                                                                    <div class="pa-3"
                                                                         style="cursor: pointer;"
                                                                         v-on="on"
                                                                    >
                                                                        <v-icon :color="icon.color" v-on="on">{{ composeIcon(icon.icon) }}</v-icon>
                                                                    </div>
                                                                </template>
                                                                <div>{{ icon.tooltip }}</div>
                                                            </v-tooltip>
                                                        </div>
                                                    </template>
                                                </v-hover>
                                            </div>
                                        </v-card>
                                    </v-menu>
                                </div>
                            </v-col>
                        </v-row>
                    </td>
                </tr>
                <tr :key="index+'_sub'" v-for="(column, index) in subtitleColumns">
                    <td class="py-2">
                        <div class="subtitle-2"
                             style="white-space: nowrap;"
                             :style="{ color: column.hidden ? 'dimgrey' : 'black' }"
                        >{{ column.subtitleLabel }}
                        </div>
                    </td>
                    <td class="py-2 pl-3">
                        <v-row no-gutters justify="end">
                            <v-col cols="auto">
                                <div v-if="column.subtitleType === 'enum'">
                                    <v-autocomplete
                                        dense
                                        outlined
                                        label="Value"
                                        hide-details
                                        clearable
                                        no-data-text="No Items"
                                        :items="getEnumValues(column.enumerators)"
                                        :value="!!filters[getSubtitleColumnValue(column)] ? filters[getSubtitleColumnValue(column)].value : null"
                                        @input="selectEnum(getSubtitleColumnValue(column), $event)"
                                        @click:clear="clearEnum(getSubtitleColumnValue(column))"
                                    ></v-autocomplete>
                                </div>
                                <div v-else-if="column.subtitleType === 'number'">
                                    <v-row dense class="flex-nowrap">
                                        <v-col cols="4">
                                            <v-autocomplete
                                                dense
                                                outlined
                                                label="Operator"
                                                hide-details
                                                no-data-text="No Items"
                                                :items="numberOperators"
                                                :value="!!filters[getSubtitleColumnValue(column)] ? filters[getSubtitleColumnValue(column)].operator : null"
                                                @input="selectOperator(getSubtitleColumnValue(column), $event)"
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
                                                label="Value"
                                                :value="!!filters[getSubtitleColumnValue(column)] ? filters[getSubtitleColumnValue(column)].value : null"
                                                :disabled="!filters[getSubtitleColumnValue(column)] || !filters[getSubtitleColumnValue(column)].operator"
                                                @input="selectNumber(getSubtitleColumnValue(column), $event)"
                                                @click:clear="clearOperator(getSubtitleColumnValue(column))"
                                            ></v-text-field>
                                        </v-col>
                                    </v-row>
                                </div>
                                <div v-else-if="column.subtitleType === 'timestamp'">
                                    <v-row dense class="flex-nowrap">
                                        <v-col cols="4">
                                            <v-autocomplete
                                                dense
                                                outlined
                                                label="Operator"
                                                hide-details
                                                no-data-text="No Items"
                                                :items="timestampOperators"
                                                :value="!!filters[getSubtitleColumnValue(column)] ? filters[getSubtitleColumnValue(column)].operator : null"
                                                @input="selectOperator(getSubtitleColumnValue(column), $event)"
                                            ></v-autocomplete>
                                        </v-col>
                                        <v-col cols="8">
                                            <v-menu
                                                transition="scale-transition"
                                                offset-y
                                                min-width="auto"
                                                :close-on-content-click="false"
                                                v-model="pickers[getSubtitleColumnValue(column)]"
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
                                                        :disabled="!filters[getSubtitleColumnValue(column)] || !filters[getSubtitleColumnValue(column)].operator"
                                                        :value="getFormattedTimestampValue(getSubtitleColumnValue(column))"
                                                        v-bind="attrs"
                                                        v-on="on"
                                                        @click:clear="clearOperator(getSubtitleColumnValue(column))"
                                                    ></v-text-field>
                                                </template>
                                                <v-date-picker
                                                    color="primary"
                                                    :value="!!filters[getSubtitleColumnValue(column)] ? filters[getSubtitleColumnValue(column)].value : null"
                                                    @input="selectTimestamp(getSubtitleColumnValue(column), $event)"
                                                ></v-date-picker>
                                            </v-menu>
                                        </v-col>
                                    </v-row>
                                </div>
                            </v-col>
                        </v-row>
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
            types: {
                type: Array,
                default: () => [],
            },
        },
        computed: {
            advancedColumns() {
                return this.columns.filter(({isAdvanced}) => isAdvanced).concat(this.extraColumns);
            },
            extraColumns() {
                return this.columns.filter(({iconConditionRawValue}) => !!iconConditionRawValue);
            },
            subtitleColumns() {
                return this.columns.filter(({subtitle, subtitleType}) => !!subtitle && this.types.includes(subtitleType));
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
            setExistingFilters() {
                const keys = Object.keys(this.data);

                if (keys.length > 0) {
                    keys.forEach((key) => {
                        if (this.data[key].operator === '===') {
                            this.data[key].operator = '=';
                        }
                        this.setFilter(key, this.data[key].value, this.data[key].operator);
                    });
                }
            },
            getColumnValue(column) {
                return column.isRaw ? column.value : column.rawValue;
            },
            getSubtitleColumnValue(column) {
                return column.subtitleIsRaw ? column.subtitle : column.rawSubtitle;
            },
            getEnumValues(items) {
                return Object.keys(items).map((key) => {
                    return {
                        value: key, text: items[key]
                    };
                });
            },
            getFormattedTimestampValue(value) {
                if (!this.filters[value] || !this.filters[value].value) {
                    return null;
                } else {
                    return this.$options.filters.humanDate(this.filters[value].value, 'D MMMM YYYY');
                }
            },
            getSelectedIcon(column) {
                let icons = column.iconMap,
                    filter = this.filters[`${this.getColumnValue(column)}_icon`];

                if (!filter && !!column.iconConditionRawValue) {
                    filter = this.filters[`${column.iconConditionRawValue}_icon`];
                }

                if (filter) {
                    return icons.find(({value, operator}) => {
                        return filter.value === value && filter.operator === operator
                    });
                }

                return null;
            },
            composeIcon(icon) {
                return icon.includes('mdi-') ? icon : `mdi-${icon}`;
            },
            selectIcon(column, icon) {
                const value = !column.iconConditionRawValue ? this.getColumnValue(column) : column.iconConditionRawValue;
                this.setFilter(`${value}_icon`, icon.value, icon.operator);
            },
            selectOperator(value, operator) {
                this.setFilter(value, null, operator);
            },
            selectNumber(value, number) {
                if (this.filters[value]) {
                    this.setFilter(value, number, this.filters[value].operator);
                } else {
                    this.setFilter(value, null, null);
                }
            },
            selectTimestamp(value, timestamp) {
                this.setFilter(value, timestamp, this.filters[value].operator);
                this.pickers[value] = false;
            },
            selectEnum(value, item) {
                if (!this.clearing) {
                    this.setFilter(value, item, '=');
                }

                this.clearing = false;
            },
            setFilter(key, value = null, operator = null) {
                if (value === null && operator === null) {
                    this.$delete(this.filters, key);
                } else {
                    if (!this.filters[key]) {
                        this.$set(this.filters, key, {});
                    }

                    this.$set(this.filters[key], 'value', value);
                    this.$set(this.filters[key], 'operator', operator);
                }
            },
            clearEnum(value) {
                this.clearing = true;
                this.setFilter(value);
            },
            clearOperator(value) {
                this.setFilter(value);
            },
            clearIcon(column) {
                const value = !column.iconConditionRawValue ? this.getColumnValue(column) : column.iconConditionRawValue;
                this.setFilter(`${value}_icon`);
            },
            clearFilters() {
                this.$emit('clear');
            },
            emitFilters() {
                // this.filterOutBrokenFilters();
                this.$emit('filters', this.filters);
            },
            filterOutBrokenFilters() {
                this.filters = Object.fromEntries(Object.entries(this.filters).filter(([key]) => this.filters[key].value !== null));
            },
        },
        mounted() {
            this.setExistingFilters();
        },
    }
</script>

<style scoped>

</style>
