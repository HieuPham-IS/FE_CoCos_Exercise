<<<<<<< HEAD
import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
=======
import { _decorator, Component, Sprite, SpriteFrame } from 'cc';
>>>>>>> 8053cb205396768ecad5fc0addac5c72a4d80f4a
const { ccclass, property } = _decorator;

@ccclass('Symbols')
export class Symbols extends Component {
    @property([SpriteFrame])
    symbolSprites: SpriteFrame[] = [];

    @property
    minSymbolCode: number = 2;

    private _sprite: Sprite;

    onLoad() {
        this._sprite = this.node.getComponent(Sprite);
        this.randomizeSymbol();
    }

    setSymbol(symbolCode?: number, spriteName?: string): void {
        if (symbolCode !== undefined && symbolCode >= 0) {
            const idx = symbolCode - this.minSymbolCode;
            if (idx >= 0 && idx < this.symbolSprites.length) {
                this._sprite.spriteFrame = this.symbolSprites[idx];
            }
        } else if (spriteName) {
            const spriteFrame = this.symbolSprites.find(sprite => sprite.name === spriteName);
            if (spriteFrame) {
                this._sprite.spriteFrame = spriteFrame;
            }
        }
    }

    randomizeSymbol(): void {
        if (!this.symbolSprites.length || !this._sprite) return;
        const code = this.minSymbolCode + Math.floor(Math.random() * this.symbolSprites.length);
        this.setSymbol(code);
    }

    getSymbolName(): string {
        return this._sprite.spriteFrame?.name ?? '';
    }
}
