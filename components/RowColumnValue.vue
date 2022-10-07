<template>
    <v-row no-gutters align="center" class="flex-nowrap">
        <v-col cols="auto" class="flex-shrink-1" style="width: 100%;">
            <v-row no-gutters align="center" class="flex-nowrap" style="width: 100%;">
                <v-col cols="auto" class="pr-1 flex-shrink-1" v-if="!!column.avatar">
                    <div v-if="!!column.avatar">
                        <v-avatar class="elevation-3" color="grey lighten-2" :size="36">
                            <div class="mt-1" v-if="!!item.avatar_url">
                                <v-menu bottom rounded="lg" :nudge-bottom="40" :disabled="!column.avatarPreview">
                                    <template #activator="{ on }">
                                        <v-img contain :style="{ cursor: !!column.avatarPreview ? 'pointer' : '' }" :width="36" :src="item.avatar_url"
                                               v-on="on"></v-img>
                                    </template>
                                    <v-card class="rounded-lg" :width="200" :height="200">
                                        <v-img contain :width="200" :src="item.avatar_url"></v-img>
                                    </v-card>
                                </v-menu>
                            </div>
                            <div v-else>{{ initials }}</div>
                        </v-avatar>
                    </div>
                </v-col>
                <v-col cols="auto" style="width: 100%;" class="flex-shrink-1">
                    <div style="line-height: 1.2; white-space: nowrap;"
                         :class="shouldCenter ? 'text-center' : ''"
                         v-if="!!item[column.value] && column.type !== 'icon'"
                    >
                        <div :style="{ fontWeight: !!item[column.subtitle] ? '500' : '' }" v-if="column.type === 'text'">
                            {{ item[column.value] }}
                        </div>
                        <div class="primary--text font-weight-bold" v-else-if="column.type === 'number'">
                            {{ item[column.value] }}
                        </div>
                        <div v-else-if="column.type === 'email'">
                            <div v-if="!hyperlinks">{{ item[column.value] }}</div>
                            <a :href="`mailto:${item[column.value]}`" v-else>{{ item[column.value] }}</a>
                        </div>
                        <div class="px-2 py-1 rounded text-center"
                             style="white-space: nowrap; background-color: #EFEFEF;"
                             v-else-if="column.type === 'timestamp'"
                        >{{ item[column.value] | humanDate(timestampFormat) }}
                        </div>
                        <div style="width: 100%;" v-else-if="column.type === 'perc'">
                            <v-progress-linear
                                rounded
                                color="primary"
                                style="min-width: 100px;"
                                :height="15"
                                :value="item[column.value]"
                            >
                                <div class="white--text font-weight-bold" style="font-size: 10px;"
                                >{{ Math.ceil(parseFloat(item[column.value])).toFixed(0) }}%
                                </div>
                            </v-progress-linear>
                        </div>
                        <div class="text-uppercase font-weight-bold" style="font-size: 11px;" v-else-if="column.type === 'enum'">
                            {{ item[column.value] }}
                        </div>
                    </div>
                    <div v-else-if="(column.type === 'icon' && item[column.value] !== null) || (column.type === 'icon' && item[column.value] === null)">
                        <template v-if="item[`${column['value']}_icon`]['icon']">
                            <v-row no-gutters justify="center" align="center" class="fill-height">
                                <v-col cols="auto">
                                    <v-tooltip bottom :disabled="!item[`${column['value']}_icon`]['tooltip']">
                                        <template #activator="{ on }">
                                            <v-icon
                                                :color="item[`${column['value']}_icon`]['color']"
                                                v-on="on"
                                            >{{ composeIcon(item[`${column['value']}_icon`]['icon']) }}
                                            </v-icon>
                                        </template>
                                        <div>{{ item[`${column['value']}_icon`]['tooltip'] }}</div>
                                    </v-tooltip>
                                </v-col>
                            </v-row>
                        </template>
                        <template v-else>-</template>
                    </div>
                    <div v-else>-</div>
                    <div style="font-size: 12px; color: dimgray;" v-if="!!item[column.subtitle]">
                        <div v-if="column.subtitleType === 'text'">
                            {{ item[column.subtitle] }}
                        </div>
                        <div class="primary--text font-weight-bold" v-else-if="column.subtitleType === 'number'">
                            {{ item[column.subtitle] }}
                        </div>
                        <div v-else-if="column.subtitleType === 'email'">
                            <div v-if="!hyperlinks">{{ item[column.subtitle] }}</div>
                            <a :href="`mailto:${item[column.subtitle]}`" v-else>{{ item[column.subtitle] }}</a>
                        </div>
                        <div v-else-if="column.subtitleType === 'timestamp'">
                            {{ item[column.subtitle] | humanDate(timestampFormat) }}
                        </div>
                        <div class="text-uppercase" style="font-size: 11px;" v-else-if="column.subtitleType === 'enum'">
                            {{ item[column.subtitle] }}
                        </div>
                    </div>
                </v-col>
            </v-row>
        </v-col>
        <v-col cols="auto" class="pl-4 flex-shrink-1"
               v-if="column.type !== 'icon' && !!column['iconConditionValue'] && !!column.iconMap && column.iconMap.length > 0">
            <template v-if="item[`${column['iconConditionValue']}_icon`]['icon']">
                <v-tooltip bottom :nudge-top="7" :disabled="!item[`${column['iconConditionValue']}_icon`]['tooltip']">
                    <template #activator="{ on }">
                        <v-icon
                            :color="item[`${column['iconConditionValue']}_icon`]['color']"
                            v-on="on"
                        >{{ composeIcon(item[`${column['iconConditionValue']}_icon`]['icon']) }}
                        </v-icon>
                    </template>
                    <div>{{ item[`${column['iconConditionValue']}_icon`]['tooltip'] }}</div>
                </v-tooltip>
            </template>
            <template v-else>-</template>
        </v-col>
    </v-row>
</template>

<script>
    import filters from "../helpers/filters";

    export default {
        name: "RowColumnValue",
        mixins: [filters],
        components: {},
        props: {
            item: {
                type: String | Number | null,
                required: true,
            },
            column: {
                type: Object,
                required: true,
            },
            hyperlinks: {
                type: Boolean,
                default: false,
            },
        },
        computed: {
            initials() {
                let initials = this.item[this.column.value].match(/\b\w/g) || [];

                return ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
            },
            timestampFormat() {
                return this.column.timestampFormat ? this.column.timestampFormat : 'D MMM YYYY';
            },
            shouldCenter() {
                return this.column.type === 'number' || this.column.type === 'enum';
            },
        },
        methods: {
            composeIcon(icon) {
                return icon.includes('mdi-') ? icon : `mdi-${icon}`;
            },
        },
    }
</script>

<style scoped>
    a {
        text-decoration: none;
        color: #013B6C !important;
    }

    a:hover {
        text-decoration: none;
        color: #2A72A1 !important;
    }
</style>
