import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Slot')
export class Slot extends Component {
    @property([SpriteFrame])
    symbolSprite: SpriteFrame[] = [];


}

