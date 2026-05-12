import { _decorator, Component, Layout, Node, Prefab, tween, Tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;
import { SlotPool } from './SlotPool';

@ccclass('Reel')
export class Reel extends Component {
    private _slot: Node[] = [];
    private _isSpinning: boolean = false;
    private _spinTween: Tween<Node> = null;
    private _symbolHeight: number = 170;
    private _stepCounter: number = 0;
    private _maxSteps: number = 15;
    private _targetResult: number[] = [];
    private _onComplete: Function = null;
    private _isStopping: boolean = false;

    public initReel(prefabs: Prefab[]) {
        this.node.removeAllChildren();
        this._slot = [];
        for (let index = 0; index < 5; index++) {
            const randomIndex = Math.floor(Math.random() * prefabs.length);
            const typeKey = prefabs[randomIndex]
            const slotNode = SlotPool.instance.getSlot(typeKey.name);

            if (slotNode) {
                slotNode.parent = this.node;
                this._slot.push(slotNode);
            }
        }
    }

    public startSpin() {
        this._isSpinning = true;
        this._isStopping = false;
        this._stepCounter = 0;
        this._runSpinStep();
    }

    public stopSpin(result: number[], onComplete: Function) {
        this._targetResult = result;
        this._onComplete = onComplete;
        this._isStopping = true;
    }

    private _runSpinStep() {
        if (!this._isSpinning) return;

        this._spinTween = tween(this.node)
            .by(0.1, { position: new Vec3(0, -this._symbolHeight, 0) })
            .call(() => {
                this._recycleSlot();
                this._stepCounter++;
                if (this._stepCounter >= this._maxSteps) {
                    this._isSpinning = false;
                    this._isStopping = true;
                    if (this._onComplete) this._onComplete();
                    return;
                }

                this._runSpinStep();
            })
            .start();
    }

    private _recycleSlot() {
        this.node.setPosition(this.node.position.x, 0, 0);
        const bottomSlot = this._slot.pop();
        if (!bottomSlot) return;

        SlotPool.instance.recycleSlot(bottomSlot);
        let nextType: string;

        const stepsLeft = this._maxSteps - this._stepCounter;
        if (this._isStopping && stepsLeft <= 4 && stepsLeft > 1) {
            nextType = this._targetResult[stepsLeft - 2].toString();
        } else {
            nextType = (Math.floor(Math.random() * 8 + 2)).toString();
        }

        const newTopSlot = SlotPool.instance.getSlot(nextType);
        newTopSlot.parent = this.node;
        this._slot.unshift(newTopSlot);
        newTopSlot.setSiblingIndex(0);

        for (let index = 0; index < 5; index++) {
            this._slot[index].setPosition(0, (2 - index) * this._symbolHeight);
        }
    }


}

