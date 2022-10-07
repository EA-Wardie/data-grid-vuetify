<template>
    <v-fade-transition>
        <div style="width: 266px;" v-show="value">
            <v-card class="ml-4" :width="250" :height="height">
                <div class="pa-3">
                    <slot name="title">
                        <div class="subtitle-2" style="white-space: nowrap; line-height: 1.2;">
                            Additional Actions
                            <v-fade-transition>
                                    <span class="grey--text" v-if="selectedItems.length > 0">
                                        ({{ selectedItems.length }} selected)
                                    </span>
                            </v-fade-transition>
                        </div>
                    </slot>
                </div>
                <v-divider></v-divider>
                <div class="overflow-y-auto" style="max-height: calc(100% - 41px);">
                    <div class="pa-3" style="white-space: nowrap;">
                        <slot></slot>
                    </div>
                    <v-divider></v-divider>
                    <div :key="index" v-for="(action, index) in actions">
                        <div v-if="!!action.show ? action.show : true">
                            <v-btn block
                                   tile
                                   text
                                   large
                                   style="white-space: nowrap;"
                                   :color="!!action.color ? action.color : 'primary'"
                                   :disabled="action.disabled"
                                   @click="action.closure(selectedItems)"
                            >{{ action.label }}
                            </v-btn>
                            <v-divider></v-divider>
                        </div>
                    </div>
                </div>
            </v-card>
        </div>
    </v-fade-transition>
</template>

<script>
    export default {
        name: "ActionDrawer",
        props: {
            value: {
                type: Boolean,
                required: true,
            },
            height: {
                type: String | Number,
                required: true,
            },
            actions: {
                type: Array,
                default: () => [],
            },
            selectedItems: {
                type: Array,
                default: () => [],
            },
        },
    }
</script>

<style scoped>

</style>
