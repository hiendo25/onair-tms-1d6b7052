 
import inst, { ManipulateType, PluginFunc, UnitType } from "dayjs";

type ManipulateTypeN = ManipulateType;

declare module "dayjs" {
	interface Dayjs {
		round(amount: number, unit?: ManipulateTypeN): inst.Dayjs;
	}
}

const round: PluginFunc = (option, dayjsClass) => {
	dayjsClass.prototype.round = function (amount, unit = "minutes") {
		const mod = this.get(unit as UnitType) % amount;

		if (mod < amount / 2) {
			return this.subtract(mod, unit).startOf(unit);
		}

		return this.add(amount - mod, unit).startOf(unit);
	};
};
export default round;
