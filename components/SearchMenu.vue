<template>
    <div style="user-select: none;">
        <div class="pa-4">
            <div class="font-weight-bold black--text" :class="data.recommendations.length > 0 ? 'mb-2' : ''">
                Search Recommendations
            </div>
            <v-expand-transition mode="out-in">
                <div key="text" class="subtitle-2 grey--text" v-if="data.recommendations.length === 0">
                    Start typing to get search recommendations.
                </div>
                <v-row key="recs" dense v-else>
                    <v-col cols="auto" :key="index" v-for="(recommendation, index) in data.recommendations">
                        <v-card flat
                                class="px-2 py-1 subtitle-2"
                                style="border: 1px solid lightgray !important;"
                                :color="isSelected(recommendation) ? 'primary lighten-3' : 'white'"
                                :dark="isSelected(recommendation)"
                                v-html="recommendation.text"
                                v-ripple="false"
                                @click="selectRecommendation(recommendation)"
                        ></v-card>
                    </v-col>
                </v-row>
            </v-expand-transition>
        </div>
        <v-divider></v-divider>
        <v-card-actions class="px-4 py-3">
            <v-spacer></v-spacer>
            <v-btn small
                   color="grey"
                   dark
                   @click="clearSearch()"
            >Clear
            </v-btn>
            <v-btn small
                   color="primary"
                   @click="emitSearch()"
            >Search
            </v-btn>
        </v-card-actions>
    </div>
</template>

<script>
    export default {
        name: "SearchMenu",
        props: {
            value: {
                type: Boolean,
                default: false,
            },
            data: {
                type: Object,
                required: true,
            },
            columns: {
                type: Array,
                required: true,
            },
        },
        computed: {
            hasSearch() {
                return !!this.data.term.length > 1;
            },
        },
        methods: {
            initState() {
                if (Array.isArray(this.data.queries)) {
                    this.$set(this.data, 'queries', {});
                }
            },
            isSelected(recommendation) {
                return !!this.data.queries[recommendation.value] && this.data.queries[recommendation.value].includes(this.data.term);
            },
            selectRecommendation(recommendation) {
                if (!this.data.queries[recommendation.value]) {
                    this.$set(this.data.queries, recommendation.value, []);
                }

                if (this.data.queries[recommendation.value]) {
                    if (!this.data.queries[recommendation.value].includes(this.data.term)) {
                        this.data.queries[recommendation.value].push(this.data.term);
                    } else {
                        const index = this.data.queries[recommendation.value].findIndex((value) => value === this.data.term);
                        if (index !== -1) {
                            this.$delete(this.data.queries[recommendation.value], index);
                        }
                    }
                }

                if (this.data.queries[recommendation.value].length === 0) {
                    this.$delete(this.data.queries, recommendation.value);
                }
            },
            clearSearch() {
                this.$set(this.data, 'queries', {});
                this.emitSearch();
            },
            emitSearch() {
                this.$emit('search', this.data.queries);
            },
        },
        beforeMount() {
            this.initState();
        },
        watch: {
            value(val) {
                if (val) {
                    this.initState();
                }
            },
        },
    }
</script>

<style scoped>

</style>
