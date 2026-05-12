import { _decorator, Component, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;
import { SlotPool } from './SlotPool';
import { Reel } from './Reel';
import { GameEventManager } from '../core/GameEventManager';
import { GameDirector } from '../core/GameDirector';

@ccclass('ReelManager')
export class ReelManager extends Component {
    @property([Prefab])
    symbolPrefabs: Prefab[] = [];

    @property([Reel])
    reels: Reel[] = [];

    @property(Node)
    directorNode: Node = null;

    private _eventManager: GameEventManager = null;
    private _stoppedReelCount: number = 0;
    private _lastSpinData: any = null;

    protected onLoad(): void {
        this.symbolPrefabs.forEach(p => {
            SlotPool.instance.addPrefab(p.name, p);
        });

        this._eventManager = this.directorNode.getComponent(GameEventManager);
    }

    protected onEnable(): void {
        this._eventManager.on('SPIN_REQUEST', this._onSpinStart, this);
        this._eventManager.on('SPIN_SUCCESS', this._onSpinSuccess, this);
    }

    protected start(): void {
        this.symbolPrefabs.forEach(p => {
            SlotPool.instance.addPrefab(p.name, p);
        });

        this.reels.forEach(reel => {
            reel.initReel(this.symbolPrefabs);
        })
    }

    private _onSpinStart() {
        this._stoppedReelCount = 0;
        this.reels.forEach(reel => reel.startSpin());
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

