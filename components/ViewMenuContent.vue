<template>
    <div style="min-width: 251px;">
        <div class="subtitle-2 black--text mb-1"
             v-if="predefinedLayouts.length > 0"
        >Pre-defined Views
        </div>
        <v-list-item
            dense
            class="px-3 list-item-outlined"
            :dark="layout.current"
            :class="[index < predefinedLayouts.length - 1 ? 'mb-3' : '', layout.current ? 'primary lighten-2' : '']"
            :key="`pre_${index}`"
            v-for="(layout, index) in predefinedLayouts"
            @click="selectLayout(layout.id)"
        >
            <v-list-item-content class="py-1">
                <v-list-item-title>{{ layout.label }}</v-list-item-title>
            </v-list-item-content>
        </v-list-item>
        <div class="subtitle-2 black--text mb-1"
             :class="predefinedLayouts.length > 0 ? 'mt-2' : ''"
        >Custom Views
        </div>
        <div :key="`cus_${index}`" v-for="(layout, index) in customLayouts">
            <v-list-item
                dense
                class="pl-3 pr-2 list-item-outlined"
                :dark="layout.current"
                :class="[index < customLayouts.length - 1 ? 'mb-3' : '', layout.current ? 'primary lighten-2' : '']"
                @click="selectLayout(layout.id)"
            >
                <v-list-item-content class="py-1">
                    <v-list-item-title>{{ layout.label }}</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action class="my-1 mr-0">
                    <v-btn icon
                           small
                           :color="layout.current ? 'white' : 'black'"
                           v-if="remove.id !== layout.id"
                           @click.stop="confirmRemoveCustomView(layout.id)"
                    >
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                    <v-btn icon
                           small
                           :color="layout.current ? 'white' : 'success'"
                           v-if="remove.confirm && remove.id === layout.id"
                           @click.stop="removeCustomView(layout)"
                    >
                        <v-tooltip top>
                            <template #activator="{ on }">
                                <v-icon v-on="on">mdi-check</v-icon>
                            </template>
                            <div>Remove View?</div>
                        </v-tooltip>
                    </v-btn>
                </v-list-item-action>
            </v-list-item>
        </div>
        <div class="mt-2" style="height: 42px;">
            <v-expand-transition>
                <v-btn text
                       block
                       outlined
                       color="primary"
                       style="border-radius: 5px;"
                       :height="42"
                       v-if="create.state === 'button'"
                       @click="initAddView()"
                >
                    <v-icon small>mdi-plus</v-icon>
                    Add View
                </v-btn>
            </v-expand-transition>
            <v-expand-transition>
                <v-text-field
                    outlined
                    hide-details
                    dense
                    autofocus
                    :height="42"
                    v-model="create.label"
                    v-if="create.state === 'input'"
                    @blur="resetAddView()"
                    @focus="removeCurrentSelectedView()"
                    @keyup.enter="addNewView()"
                >
                    <template #append>
                        <v-icon :color="newViewLabelIsValid ? 'success' : 'grey'">
                            mdi-check
                        </v-icon>
                    </template>
                </v-text-field>
            </v-expand-transition>
        </div>
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
                       :disabled="!selected && !create.label"
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
            value: {
                type: Boolean,
                default: false,
            },
        },
        computed: {
            predefinedLayouts() {
                return this.innerLayouts.filter(({custom}) => !custom);
            },
            customLayouts() {
                return this.innerLayouts.filter(({custom, id}) => custom && id !== 'custom_hidden');
            },
            newViewLabelIsValid() {
                return !!this.create.label
                    && this.create.label.length > 2
                    && !this.innerLayouts.map(i => i['label']).includes(this.create.label);
            },
        },
        data() {
            return {
                innerLayouts: [],
                selected: null,
                create: {
                    state: 'button',
                    label: null,
                },
                remove: {
                    confirm: false,
                    id: null,
                },
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
            emitValue(id) {
                if (this.create && this.create.label) {
                    this.addNewView();
                } else {
                    if (id === null) {
                        this.$emit('layout', null);
                    } else if (!this.selected) {
                        const found = this.innerLayouts.find(({current}) => current);
                        this.selected = found ? found.id : null;
                    }

                    this.$emit('layout', this.selected);
                }
            },
            initAddView() {
                this.create.state = 'input';
            },
            resetAddView() {
                const existingView = this.layouts.find(({current}) => current);

                if (existingView) {
                    const view = this.innerLayouts.find(({id}) => id === existingView.id);

                    if (view) {
                        this.$set(view, 'current', true);
                    }
                }
            },
            addNewView() {
                const layout = {
                    id: `custom_${this.innerLayouts.length}`,
                    label: this.create.label,
                };
                this.$emit('add', layout);
            },
            confirmRemoveCustomView(id) {
                this.remove.id = id;
                this.remove.confirm = true;
            },
            removeCustomView(layout) {
                this.$emit('remove', layout);
                this.remove.confirm = false;
                this.remove.id = null;
            },
            removeCurrentSelectedView() {
                const view = this.innerLayouts.find(({current}) => current);

                if (view) {
                    this.$set(view, 'current', false);
                }
            },
        },
        watch: {
            layouts: {
                deep: true,
                handler() {
                    this.cloneInner();
                },
            },
            value() {
                this.create.label = null;
                this.create.state = 'button';
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
