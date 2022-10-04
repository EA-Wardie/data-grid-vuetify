<template>
    <v-list-item dense class="px-0" :disabled="disabled">
        <v-list-item-icon :class="dense ? 'mr-0' : 'mr-2'" style="margin-top: 13px;">
            <v-icon :disabled="disabled" :color="iconColor">{{ icon }}</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
            <v-list-item-title>
                <slot></slot>
            </v-list-item-title>
        </v-list-item-content>
        <v-list-item-action class="ml-1" v-if="!hideAction">
            <slot name="action">
                <v-menu bottom :value="value" :nudge-bottom="32" :close-on-content-click="false" @input="emitValue($event)">
                    <template #activator="{ on }">
                        <v-btn icon small v-on="on">
                            <v-icon>{{ actionIcon }}</v-icon>
                        </v-btn>
                    </template>
                    <v-card>
                        <v-card-text>
                            <slot name="menu"></slot>
                        </v-card-text>
                    </v-card>
                </v-menu>
            </slot>
        </v-list-item-action>
    </v-list-item>
</template>

<script>
    export default {
        name: "HeaderFilterAction",
        props: {
            value: {
                type: Boolean,
                default: false,
            },
            icon: {
                type: String,
                required: true,
            },
            iconColor: {
                type: String,
                default: 'grey',
            },
            actionIcon: {
                type: String,
                default: 'mdi-chevron-down',
            },
            disabled: {
                type: Boolean,
                default: false,
            },
            dense: {
                type: Boolean,
                default: false,
            },
            hideAction: {
                type: Boolean,
                default: false,
            },
        },
        methods: {
            emitValue(value) {
                this.$emit('input', value);
            },
        },
    }
</script>

<style scoped>

</style>
