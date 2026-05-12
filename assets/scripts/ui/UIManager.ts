import { _decorator, Button, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

import { GameEventManager } from '../core/GameEventManager';
import * as utils from '../utils/utils';
import { GameDirector } from '../core/GameDirector';

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

    @property(Label)
    labelWinAmount: Label = null;

    @property(Button)
    minusBetButton: Button = null;

    @property(Button)
    plusBetButton: Button = null;

    @property(Button)
    spinButton: Button = null;

    @property(Node)
    director: Node = null;

    private _eventManager: GameEventManager = null;
    private _autoSpinCount: number = 0;
    private _currentWallet: number = 0;

    public betLevel: any[] = [];
    public jackpotValue: number[] = [];
    public currentBetIndex: number = 0;


    protected onLoad(): void {
        this._eventManager = this.director.getComponent(GameEventManager);
        this.inactivateButton();
    }

    protected onEnable(): void {
        this._eventManager.on('JOIN_GAME_SUCCESS', this.onJoinGameSuccess, this);
        this._eventManager.on('SHOW_RESULT_FINISHED', this.onSpinResult, this);

    }

    protected onDisable(): void {
        this._eventManager.off('JOIN_GAME_SUCCESS', this.onJoinGameSuccess, this);
        this._eventManager.off('SHOW_RESULT_FINISHED', this.onSpinResult, this);
    }

    protected onJoinGameSuccess(data: any): void {
        this.betLevel = this.parseMainBet(data.mainBet);
        this.currentBetIndex = 0;
        this.jackpotValue = Object.keys(data.jackpot).map(key => Number(data.jackpot[key]));
        this._currentWallet = data.wallet;

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
        if (this.betLevel.length === 0) return;
        const currentBet = this.betLevel[this.currentBetIndex];

        this._currentWallet -= currentBet.totalBet;
        const directorComp = this.director.getComponent(GameDirector);
        if (directorComp && directorComp.joinGameData) {
            directorComp.joinGameData.json.wallet = this._currentWallet;
        }
        this.updateWalletLabel(this._currentWallet);
        this.inactivateButton();
        this.labelWinAmount.string = '';
        const currentBetId = currentBet.betId;
        if (globalThis.testGame) {
            globalThis.testGame.sendSpinRequest(currentBetId);
        }
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

    private onSpinResult(data: any) {
        this._currentWallet = data.wallet;
        utils.tweenMoney(this.labelWinAmount, 0.5, data.winAmount, { acceptRunDown: false }, (value) => "$" + utils.formatMoney(value));
        this.updateWalletLabel(this._currentWallet)
        this.activateButton();
    }

    private updateBetLabel() {
        if (!this.betLevel.length) return;
        const level = this.betLevel[this.currentBetIndex];
        utils.tweenMoney(this.labelBet, 0.5, level.betDemon, { acceptRunDown: true }, (value) => "$" + utils.formatMoney(value));
        utils.tweenMoney(this.labelBetTotal, 0.5, level.totalBet, { acceptRunDown: true }, utils.formatMoney);
    }

    private updateJackpotLabel() {
        const jackpot = this.jackpotValue[this.currentBetIndex] ?? 0;
        utils.tweenMoney(this.labelJackpot, 0.5, jackpot, { acceptRunDown: true }, (value) => "$" + utils.formatMoney(value));
    }

    private updateWalletLabel(amount: number) {
        utils.tweenMoney(this.labelWallet, 0.5, amount, { acceptRunDown: true }, (value) => "$" + utils.formatMoney(value));
    }

    private inactivateButton() {
        this.minusBetButton.interactable = false;
        this.plusBetButton.interactable = false;
        this.spinButton.interactable = false;
    }

    private activateButton() {
        this.minusBetButton.interactable = this.currentBetIndex > 0;
        this.plusBetButton.interactable = this.currentBetIndex < this.betLevel.length - 1;
        this.spinButton.interactable = true;
    }

}

