import { _decorator, Button, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

import { GameEventManager } from '../core/GameEventManager';
import * as utils from '../utils/utils';

@ccclass('UIManager')
export class UIManager extends Component {
    @property(Label)
    labelWallet: Label = null;

    @property(Label)
    labelJackpot: Label = null;

    @property(Label)
    labelBet: Label = null;

    @property(Label)
    labelBetTotal: Label = null;

    @property(Button)
    minusBetButton: Button = null;

    @property(Button)
    plusBetButton: Button = null;

    @property(Button)
    spinButton: Button = null;

    @property(Node)
    director: Node = null;

    private _eventManager: GameEventManager = null;

    public betLevel: any[] = [];
    public jackpotValue: number[] = [];
    public currentBetIndex: number = 0;

    protected onLoad(): void {
        this._eventManager = this.director.getComponent(GameEventManager);
        this.inactivateButton();
    }

    protected onEnable(): void {
        this._eventManager.on('JOIN_GAME_SUCCESS', this.onJoinGameSuccess, this);
        this._eventManager.on('SPIN_REQUEST', this.onSpinResult, this);

    }

    protected onDisable(): void {
        this._eventManager.off('JOIN_GAME_SUCCESS', this.onJoinGameSuccess, this);
        this._eventManager.off('SPIN_REQUEST', this.onSpinResult, this);
    }

    protected onJoinGameSuccess(data: any): void {
        this.betLevel = this.parseMainBet(data.mainBet);
        this.currentBetIndex = 0;
        this.jackpotValue = Object.keys(data.jackpot).map(key => Number(data.jackpot[key]));

        this.updateBetLabel();
        this.updateJackpotLabel();
        this.updateWalletLabel(data.wallet);
        this.activateButton();
    }

    private parseMainBet(mainBet: string): any[] {
        return mainBet.split(',').map((pair) => {
            const [betId, betValue] = pair.split(';');
            const totalBet = Number(betValue);
            const betDemon = totalBet / 25;
            return { betId, totalBet, betDemon }
        })
    }

    private onClickSpin() {

    }

    private onClickPlus() {
        if (this.currentBetIndex >= this.betLevel.length - 1) return;
        this.currentBetIndex++;
        this.updateBetLabel();
        this.updateJackpotLabel();
        this.activateButton();


    }

    private onClickMinus() {
        if (this.currentBetIndex <= 0) return;
        this.currentBetIndex--;
        this.updateBetLabel();
        this.updateJackpotLabel();
        this.activateButton();
    }

    private onSpinResult() {
        this.activateButton();
    }

    private updateBetLabel() {
        if (!this.betLevel.length) return;
        const level = this.betLevel[this.currentBetIndex];
        utils.tweenMoney(this.labelBet, 1, level.betDemon, { acceptRunDown: true }, (value) => "$" + utils.formatMoney(value));
        utils.tweenMoney(this.labelBetTotal, 1, level.totalBet, { acceptRunDown: true }, utils.formatMoney);
    }

    private updateJackpotLabel() {
        const jackpot = this.jackpotValue[this.currentBetIndex] ?? 0;
        utils.tweenMoney(this.labelJackpot, 1, jackpot, { acceptRunDown: true }, (value) => "$" + utils.formatMoney(value));
    }

    private updateWalletLabel(amount: number) {
        utils.tweenMoney(this.labelWallet, 1, amount, { acceptRunDown: true }, (value) => "$" + utils.formatMoney(value));
    }

    private inactivateButton() {
        this.minusBetButton.interactable = false;
        this.plusBetButton.interactable = false;
    }

    private activateButton() {
        this.minusBetButton.interactable = this.currentBetIndex > 0;
        this.plusBetButton.interactable = this.currentBetIndex < this.betLevel.length - 1;
    }

}

