import moment from "moment";

export default {
    filters: {
        humanDate(value, format) {
            if (!value) {
                return '';
            }

            return moment(value).format(format);
        },
    },
}
