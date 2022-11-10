<template>
    <v-fade-transition>
        <div :style="{ width: `${width}px` }" v-show="value">
            <v-card class="ml-4" style="border-bottom-left-radius: 0; border-bottom-right-radius: 0;" :width="width - 16" :height="height">
                <div class="overflow-y-auto overflow-x-hidden" style="max-height: 100%;">
                    <div class="pa-3" style="white-space: nowrap;">
                        <slot></slot>
                    </div>
                    <v-divider v-if="actions.length > 0"></v-divider>
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
            <div style="height: 5px; border-bottom-left-radius: 4px; border-bottom-right-radius: 4px;"
                 class="ml-4"
                 :style="{ width: `${width - 16}px` }"
                 :class="color"></div>
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
            width: {
                type: String | Number,
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
            color: {
                type: String,
                default: 'primary',
            },
        },
    }
</script>

<style scoped>

</style>
