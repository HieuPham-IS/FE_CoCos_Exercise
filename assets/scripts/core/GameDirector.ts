import { _decorator, Component, JsonAsset, warn } from 'cc';
import { GameEventManager } from './GameEventManager';
const { ccclass, property } = _decorator;

@ccclass('DataByBetId')
export class DataByBetId {
    @property({ displayName: 'Bet Id' })
    betId: string = "";

	@property(JsonAsset)
	data: JsonAsset = null;
}

@ccclass('GameDirector')
export class GameDirector extends Component {
    @property({ type: JsonAsset })
	joinGameData: JsonAsset;

    @property({ type: [DataByBetId] })
	dataByBetId: DataByBetId[] = [];

    eventManager: GameEventManager = null;

    onLoad(): void {
        this.eventManager = this.node.getComponent(GameEventManager);

        globalThis.testGame = this;
    }
    
    start(): void {
        this.onJoinGameRequest();
    }

    onJoinGameRequest(): void {
        this.scheduleOnce(() => {
            this.onJoinGameSuccess();
        }, 0.2);
    }

    onJoinGameSuccess(): void {
        const data = this.joinGameData.json;
        warn("%c onJoinGameSuccess ", "color: red", data);
        this.eventManager.emit("JOIN_GAME_SUCCESS", data);
    }

    sendSpinRequest(betId: string): void {
        warn("%c sendSpinRequest ", "color: red", betId);
        
        this.scheduleOnce(() => {
            const resultData = this.dataByBetId.find(data => data.betId === betId).data.json;
            warn("%c resultData ", "color: red", resultData);
            this.eventManager.emit("SPIN_REQUEST", resultData);
        }, 0.3);
    }
}

