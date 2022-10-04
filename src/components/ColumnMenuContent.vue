<template>
    <div style="width: 200px;">
        <div class="subtitle-2 mb-1">Columns</div>
        <draggable handle=".handle" v-model="innerColumns" @end="updateOrder()">
            <v-list-item
                dense
                class="px-3 list-item-outlined handle"
                :class="index < innerColumns.length - 1 ? 'mb-3' : ''"
                :key="`${column.value}_${index}`"
                v-for="(column, index) in innerColumns"
            >
                <v-list-item-content class="py-1">
                    <v-card flat tile :disabled="column.hidden">
                        <v-list-item-title>{{ column.label }}</v-list-item-title>
                    </v-card>
                </v-list-item-content>
                <v-list-item-action class="ml-4 my-0">
                    <v-btn icon small @click="switchHidden(column)">
                        <v-icon>{{ column.hidden ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
                    </v-btn>
                </v-list-item-action>
                <v-list-item-icon class="ml-2 mt-2 mb-0">
                    <v-icon>mdi-drag-horizontal-variant</v-icon>
                </v-list-item-icon>
            </v-list-item>
        </draggable>
        <v-row no-gutters class="mt-4">
            <v-col cols="6" class="pr-2">
                <v-btn block small dark color="grey" @click="emitClearChanges()">Clear</v-btn>
            </v-col>
            <v-col cols="6" class="pl-2">
                <v-btn block small color="primary" @click="emitColumnChanges()">Apply</v-btn>
            </v-col>
        </v-row>
    </div>
</template>

<script>
    import draggable from 'vuedraggable';

    export default {
        name: "ColumnMenuContent",
        components: {
            draggable,
        },
        props: {
            columns: {
                type: Array,
                required: true,
            },
        },
        data() {
            return {
                innerColumns: [],
            };
        },
        methods: {
            cloneInner() {
                this.innerColumns = JSON.parse(JSON.stringify(this.columns));
            },
            switchHidden(column) {
                this.$set(column, 'hidden', !column.hidden);
            },
            updateOrder() {
                this.innerColumns = this.innerColumns.map((column, index) => {
                    column.index = index;
                    return column;
                });
            },
            clearChanges() {
                this.innerColumns = this.innerColumns.map((column) => {
                    column.index = column.originalIndex;
                    column.hidden = false;
                    return column;
                });
            },
            emitColumnChanges() {
                this.emitChanges();
            },
            emitClearChanges() {
                this.clearChanges();
                this.emitChanges();
            },
            emitChanges() {
                this.$emit('view', this.innerColumns);
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
        background-color: white !important;
    }
</style>
