<template>
    <div style="width: 200px;">
        <div class="subtitle-2 mb-1">Views</div>
        <v-list-item
            dense
            class="px-3 list-item-outlined"
            :dark="layout.current"
            :class="[index < innerLayouts.length - 1 ? 'mb-3' : '', layout.current ? 'primary lighten-2' : '']"
            :key="index"
            v-for="(layout, index) in innerLayouts"
            @click="selectLayout(layout.id)"
        >
            <v-list-item-content class="py-1">
                <v-list-item-title>{{ layout.label }}</v-list-item-title>
            </v-list-item-content>
            <v-list-item-icon class="ml-2 mt-2 mb-0">
                <v-icon>mdi-chevron-right</v-icon>
            </v-list-item-icon>
        </v-list-item>
        <v-row no-gutters class="mt-4">
            <v-col cols="6" class="pr-2">
                <v-btn block
                       small
                       dark
                       color="grey"
                       @click="clearLayout()"
                >Clear
                </v-btn>
            </v-col>
            <v-col cols="6" class="pl-2">
                <v-btn block
                       small
                       color="primary"
                       @click="emitValue()"
                >Apply
                </v-btn>
            </v-col>
        </v-row>
    </div>
</template>

<script>
    export default {
        name: "ViewMenuContent",
        props: {
            layouts: {
                type: Array,
                required: true,
            },
        },
        data() {
            return {
                innerLayouts: [],
                selected: null,
            };
        },
        methods: {
            cloneInner() {
                this.innerLayouts = JSON.parse(JSON.stringify(this.layouts));
            },
            clearLayout() {
                this.emitValue(null);
            },
            selectLayout(selected) {
                this.innerLayouts = this.innerLayouts.map((layout) => {
                    this.$set(layout, 'current', layout.id === selected);

                    return layout;
                });

                this.selected = selected;
            },
            emitValue() {
                this.$emit('layout', this.selected);
            },
        },
        beforeMount() {
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
