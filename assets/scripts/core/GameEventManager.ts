import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("GameEventManager")
export class GameEventManager extends Component {
	on(event: string, listener: Function, context: any = null): void {
		this.node.on(event, listener, context);
	}

	off(event: string, listener: Function, context: any = null): void {
		this.node.off(event, listener, context);
	}

	emit(event: string, ...args: any[]): void {
		this.node.emit(event, ...args);
	}

	targetOff(context: any): void {
		this.node.targetOff(context);
	}

	onDestroy(): void {
		this.targetOff(this);
	}
}
