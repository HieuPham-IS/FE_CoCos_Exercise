import { _decorator, Component, Node, tween, Tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;
import { SlotPool } from './SlotPool';
import { Symbols } from './Symbols';

@ccclass('Reel')
export class Reel extends Component {
    private _slot: Node[] = [];
    private _poolKey: string = '';
    private _isSpinning: boolean = false;
    private _spinTween: Tween<Node> = null;
    private _symbolHeight: number = 170;
    private _stepCounter: number = 0;
    private _maxSteps: number = 15;
    private _targetResult: number[] = [];
    private _onComplete: Function = null;
    private _isStopping: boolean = false;

    public initReel(poolKey: string, _symbolCount?: number) {
        this._poolKey = poolKey;
        this.node.removeAllChildren();
        this._slot = [];
        for (let index = 0; index < 5; index++) {
            const slotNode = SlotPool.instance.getSlot(this._poolKey);
            if (slotNode) {
                slotNode.parent = this.node;
                const sym = slotNode.getComponent(Symbols);
                sym?.randomizeSymbol();
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
                    this._completeSpin();
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

        let matrixCode: number | undefined;
        const stepsLeft = this._maxSteps - this._stepCounter;
        if (this._isStopping && stepsLeft <= 4 && stepsLeft > 1) {
            matrixCode = this._targetResult[stepsLeft - 2];
        }

        const newTopSlot = SlotPool.instance.getSlot(this._poolKey);
        if (!newTopSlot) return;

        newTopSlot.parent = this.node;
        const sym = newTopSlot.getComponent(Symbols);
        if (matrixCode !== undefined) {
            sym?.setSymbol(matrixCode);
        } else {
            sym?.randomizeSymbol();
        }
        this._slot.unshift(newTopSlot);
        newTopSlot.setSiblingIndex(0);

        for (let index = 0; index < 5; index++) {
            this._slot[index].setPosition(0, (2 - index) * this._symbolHeight);
        }
    }

    private _applyTargetToVisibleSlots(): void {
        const r = this._targetResult;
        if (!r || r.length < 3) return;
        for (let i = 0; i < 3; i++) {
            const node = this._slot[i + 1];
            node?.getComponent(Symbols)?.setSymbol(r[i]);
        }
    }

    private _completeSpin(): void {
        this._applyTargetToVisibleSlots();
        this._isSpinning = false;
        this._isStopping = false;
        const cb = this._onComplete;
        this._onComplete = null;
        if (cb) cb();
    }


}

