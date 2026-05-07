import "dayjs/locale/vi";

import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import duration from "dayjs/plugin/duration";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import timezonePlugin from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import round from "./plugin/round";

export * from "./utils";

dayjs.extend(utc);
dayjs.extend(timezonePlugin);
dayjs.extend(isSameOrBefore);
dayjs.extend(advancedFormat);

dayjs.extend(isSameOrAfter);
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.extend(duration);
dayjs.extend(round);
dayjs.extend(customParseFormat);
const TIME_ZONE = "Asia/Ho_Chi_Minh";

dayjs.tz.setDefault(TIME_ZONE);
dayjs.locale("vi");

export default dayjs;
export { TIME_ZONE };
