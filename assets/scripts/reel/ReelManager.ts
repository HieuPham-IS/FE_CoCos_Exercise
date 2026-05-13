import { _decorator, Component, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;
import { SlotPool } from './SlotPool';
import { Reel } from './Reel';
import { GameEventManager } from '../core/GameEventManager';
import { GameDirector } from '../core/GameDirector';

@ccclass('ReelManager')
export class ReelManager extends Component {
    @property(Prefab)
    symbolPrefab: Prefab = null;

    @property
    symbolCount: number = 8;

    @property([Reel])
    reels: Reel[] = [];

    @property(Node)
    directorNode: Node = null;

    private _eventManager: GameEventManager = null;
    private _stoppedReelCount: number = 0;
    private _lastSpinData: any = null;

    protected onLoad(): void {
        if (this.symbolPrefab) {
            SlotPool.instance.addPrefab(this.symbolPrefab.name, this.symbolPrefab);
        }
        this._eventManager = this.directorNode.getComponent(GameEventManager);
    }

    protected onEnable(): void {
        this._eventManager.on('SPIN_REQUEST', this._onSpinStart, this);
    }

    protected start(): void {
        if (!this.symbolPrefab) return;
        this.reels.forEach(reel => {
            reel.initReel(this.symbolPrefab.name, this.symbolCount);
        });
    }

    protected onDisable(): void {
        this._eventManager.off('SPIN_REQUEST', this._onSpinStart, this);
    }

    private _onSpinStart(data: any) {
        this._stoppedReelCount = 0;
        this.reels.forEach(reel => reel.startSpin());
        this._onSpinSuccess(data);
    }

    private _onSpinSuccess(data: any) {
        this._lastSpinData = data;
        const matrix = data.matrix;

        this.reels.forEach((reel, i) => {
            const columnResult = [matrix[i * 3], matrix[i * 3 + 1], matrix[i * 3 + 2]];
            console.log(columnResult);

            this.scheduleOnce(() => {
                reel.stopSpin(columnResult, () => {
                    this._onReelStopped();
                });
            });
        });
    }

    private _onReelStopped() {
        this._stoppedReelCount++;
        if (this._stoppedReelCount === this.reels.length) {
            this._showFinalResult();
        }
    }

    private _showFinalResult() {
        if (!this._lastSpinData) return;
        const director = this.directorNode.getComponent(GameDirector);
        let currentWallet = director.joinGameData.json.wallet;

        currentWallet += this._lastSpinData.winAmount;
        director.joinGameData.json.wallet = currentWallet;

        this._eventManager.emit('SHOW_RESULT_FINISHED', {
            winAmount: this._lastSpinData.winAmount,
            wallet: currentWallet
        });

    }


}

