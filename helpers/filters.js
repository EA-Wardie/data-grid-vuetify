import moment from "moment";

export default {
    filters: {
        humanDate(value, format = 'dddd, D MMMM YYYY') {
            if (!value) {
                return '';
            }
            return moment(value).format(format);
        },
    },
}