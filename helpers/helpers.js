export const debounce = (func, delay) => {
    let inDebounce;
    return function () {
        const context = this;
        const args = arguments;
        clearTimeout(inDebounce);
        inDebounce = setTimeout(() => func.apply(context, args), delay);
    }
};

export function getRecommendations(columns, term) {
    const recommendations = [];
    columns.forEach((column) => {
        if (!column.isAdvanced && column.searchable && !!term) {
            const value = column.isRaw ? column.value : column.rawValue;
            recommendations.push({
                text: `${column.label} contains "${term}"`,
                value: value,
            });
        }

        if ((!!column.subtitle || !!column.rawSubtitle) && column.searchable && !!term) {
            const subtitle = column.subtitleIsRaw ? column.subtitle : column.rawSubtitle;
            recommendations.push({
                text: `${column.subtitleLabel} contains "${term}"`,
                value: subtitle,
            });
        }
    });

    return recommendations;
}
