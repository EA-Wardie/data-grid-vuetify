<template>
    <div style="width: 200px;">
        <div class="subtitle-2 mb-1">Go to Page</div>
        <v-text-field
            dense
            outlined
            single-line
            hide-details
            autofocus
            v-model="page"
            @keyup.enter="goToPage()"
        ></v-text-field>
        <v-btn block
               small
               class="mt-3"
               color="primary"
               :disabled="!canGoToPage"
               @click="goToPage()"
        >Go
        </v-btn>
        <div class="subtitle-2 mb-1 mt-3" v-if="jumpOptions.length > 0">Jump to Page</div>
        <v-row dense class="flex-nowrap" v-if="jumpOptions.length > 0">
            <v-col :cols="12 / jumpOptions" :key="index" v-for="(option, index) in jumpOptions">
                <v-btn block
                       color="primary"
                       outlined
                       small
                       @click="goToPageFromOption(option)"
                >{{ option }}
                </v-btn>
            </v-col>
        </v-row>
        <div class="subtitle-2 mb-1 mt-3">Items per Page</div>
        <v-autocomplete
            dense
            outlined
            single-line
            hide-details
            :items="[10, 20, 50, 100]"
            v-model="innerItemsPerPage"
            @input="emitItemsPerPage()"
        ></v-autocomplete>
    </div>
</template>

<script>
    export default {
        name: "PageMenuContent",
        props: {
            totalPages: {
                type: Number,
                required: true,
            },
            itemsPerPage: {
                type: Number,
                default: 50,
            }
        },
        computed: {
            jumpOptions() {
                if (this.totalPages > 99) {
                    return [
                        1,
                        Math.floor(this.totalPages / 3),
                        Math.floor(this.totalPages / 1.5),
                        this.totalPages,
                    ];
                } else if (this.totalPages > 1) {
                    return [1, this.totalPages];
                } else {
                    return [];
                }
            },
            canGoToPage() {
                return this.page > 0 && this.page <= this.totalPages;
            },
        },
        data() {
            return {
                page: null,
                innerItemsPerPage: null,
            };
        },
        methods: {
            closeMenu() {
                this.$emit('close');
            },
            goToPage() {
                this.$emit('go', this.page);
                this.page = null;
            },
            goToPageFromOption(page) {
                this.$emit('go', page);
            },
            emitItemsPerPage() {
                this.$emit('itemsPerPage', this.innerItemsPerPage);
            },
        },
        mounted() {
            this.innerItemsPerPage = this.itemsPerPage;
        },
    }
</script>

<style scoped>

</style>
