import { Label, tween, Tween, warn } from "cc";

export function formatMoney(amount: number, decimalCount: number = 0, decimal = ".", thousands = ","): string {
	const splitStr = amount.toFixed(decimalCount).split(".");
	const decimalStr = splitStr[1] || "";
	const integerArr = splitStr[0].split("");
	let index = integerArr.length;
	while ((index -= 3) > 0) {
		integerArr.splice(index, 0, thousands);
	}
	if (decimalStr) {
		integerArr.push(decimal, decimalStr);
	}
	return integerArr.join("");
}

export function tweenMoney(label: Label, duration: number, endValue: number, options: {}, formatter: Function): Tween<any> {
	if (!(label instanceof Label)) {
		warn("target.getComponent(Label) is equal to null");
		return;
	}
	if (label["_tweenMoney"]) {
		label["_tweenMoney"].stop();
	}

	options = options || {};
	const onCompleteCallback = options["onComplete"] || null;
	delete options["onComplete"];
	const onUpdateCallback = options["onUpdate"] || null;
	delete options["onUpdate"];
	const acceptRunDown = options["acceptRunDown"] || false;
	delete options["acceptRunDown"];

	let currentVal = this.parseValueFromString(label.string);

	if ((!acceptRunDown && endValue < currentVal) || duration === 0) {
		label.string = formatter(endValue);
		onCompleteCallback && onCompleteCallback();
		return;
	}

	const _target = { value: currentVal };
	let tweenMoney = tween(_target)
		.to(duration, { value: endValue }, {
            progress: (start, end, current, ratio) => {
                label.string = formatter(Number(current));
                onUpdateCallback && onUpdateCallback(_target, ratio);
                return start + (end - start) * ratio;
            },
        })
		.call(() => {
			label.string = formatter(endValue);
			onCompleteCallback && onCompleteCallback();
			label["_tweenMoney"] = null;
		})
		.start();
	label["_tweenMoney"] = tweenMoney;

	return tweenMoney;
}

export function parseValueFromString(valueStr: string): number {
	valueStr = valueStr.replace(/,/g, "");
	valueStr = valueStr.replace(/[^\d.]/g, "");

	return Number(valueStr);
}
