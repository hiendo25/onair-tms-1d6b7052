// @ts-nocheck
// ----------------------------------------------------------------------

/*
 * Locales code
 * https://gist.github.com/raushankrjha/d1c7e35cf87e69aa8b4208a8171a8416
 */

export type InputNumberValue = string | number | null | undefined;

type Options = Intl.NumberFormatOptions | undefined;

const DEFAULT_LOCALE = { code: "vi-VN", currency: "VND" };

function processInput(inputValue: InputNumberValue): number | null {
	if (inputValue == null || Number.isNaN(inputValue)) return null;
	return Number(inputValue);
}

// ----------------------------------------------------------------------

export function formatNumber(inputValue: InputNumberValue, options?: Options) {
	const locale = DEFAULT_LOCALE;

	const number = processInput(inputValue);
	if (number === null) return "";

	const fm = new Intl.NumberFormat(locale.code, {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
		...options,
	}).format(number);

	return fm;
}

// ----------------------------------------------------------------------

export function formatCurrency(
	inputValue: InputNumberValue,
	options?: Options,
) {
	const locale = DEFAULT_LOCALE;

	const number = processInput(inputValue);
	if (number === null) return "";

	const fm = new Intl.NumberFormat(locale.code, {
		style: "currency",
		currency: locale.currency,
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
		...options,
	}).format(number);

	return fm;
}

export function formatCurrencyV2(
	inputValue: InputNumberValue,
	options?: Options,
	hideFreeText?: boolean,
) {
	const locale = DEFAULT_LOCALE;

	const number = processInput(inputValue);
	if (number === null) return "";

	if (number === 0 && !hideFreeText) {
		return "Miễn phí";
	}

	const fm = new Intl.NumberFormat(locale.code, {
		style: "currency",
		currency: locale.currency,
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
		...options,
	}).format(number);

	return fm;
}

// ----------------------------------------------------------------------

export function formatPercent(inputValue: InputNumberValue, options?: Options) {
	const locale = DEFAULT_LOCALE;

	const number = processInput(inputValue);
	if (number === null) return "";

	const fm = new Intl.NumberFormat(locale.code, {
		style: "percent",
		minimumFractionDigits: 0,
		maximumFractionDigits: 1,
		...options,
	}).format(number / 100);

	return fm;
}

// ----------------------------------------------------------------------

export function formatShortenNumber(
	inputValue: InputNumberValue,
	options?: Options,
) {
	const locale = DEFAULT_LOCALE;

	const number = processInput(inputValue);
	if (number === null) return "";

	const fm = new Intl.NumberFormat(locale.code, {
		notation: "compact",
		maximumFractionDigits: 2,
		...options,
	}).format(number);

	return fm;
}

// ----------------------------------------------------------------------

export function formatData(inputValue: InputNumberValue) {
	const number = processInput(inputValue);
	if (number === null || number === 0) return "0 bytes";

	const units = ["bytes", "Kb", "Mb", "Gb", "Tb", "Pb", "Eb", "Zb", "Yb"];
	const decimal = 2;
	const baseValue = 1024;

	const index = Math.floor(Math.log(number) / Math.log(baseValue));
	const fm = `${parseFloat((number / baseValue ** index).toFixed(decimal))} ${units[index]}`;

	return fm;
}

export function formartCurrencyVietnamdong(
	inputValue: InputNumberValue,
	options?: Options,
) {
	const fm = formatCurrency(inputValue, options, true);
	if (options?.currencyDisplay === "code" && options.currency === "VND") {
		return fm.replace("VND", "đ");
	}

	return fm;
}

export function formatShortCurrencyVietnamese(amount: number) {
	const amountStr = amount.toString();

	if (amountStr.length <= 3) {
		return formatCurrency(amount, { currencyDisplay: "symbol" });
	}

	if (amountStr.length > 3 && amountStr.length <= 6) {
		const decimalOfThousand = amountStr.slice(-3);
		const thousand = amountStr.slice(0, -3);

		let finalDecimalNumber: string;
		if (parseInt(decimalOfThousand) !== 0) {
			for (let i = decimalOfThousand.length - 1; i >= 0; i--) {
				if (parseInt(decimalOfThousand[i]) !== 0) {
					finalDecimalNumber = decimalOfThousand.slice(0, i + 1);
					break;
				}
			}
		}
		const finalThousand = finalDecimalNumber
			? [thousand, ",", finalDecimalNumber, "K"].join("")
			: [thousand, "K"].join("");

		return finalThousand;
	}

	if (amountStr.length > 6) {
		const millionOfDecimal = amountStr.slice(-6);
		const million = amountStr.slice(0, -6);
		const formatMillion = million.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

		let finalDecimalNumber: string;

		if (parseInt(millionOfDecimal) !== 0) {
			for (let i = millionOfDecimal.length - 1; i >= 0; i--) {
				if (parseInt(millionOfDecimal[i]) !== 0) {
					finalDecimalNumber = millionOfDecimal.slice(0, i + 1);
					break;
				}
			}
		}

		const finalMillionNumber = finalDecimalNumber
			? [formatMillion, ",", finalDecimalNumber, "Tr"].join("")
			: [formatMillion, "Tr"].join("");

		return finalMillionNumber;
	}
}
