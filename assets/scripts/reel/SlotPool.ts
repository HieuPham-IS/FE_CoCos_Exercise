import { Node, Prefab, instantiate } from 'cc';

export class SlotPool {
    private static _instance: SlotPool = null;
    public static get instance(): SlotPool {
        if (!SlotPool._instance) SlotPool._instance = new SlotPool();
        return SlotPool._instance;
    }

    private _pools: Map<string, Set<Node>> = new Map();
    private _prefabs: Map<string, Prefab> = new Map();

    private constructor() { }

    public addPrefab(name: string, prefab: Prefab): void {
        this._prefabs.set(name, prefab);
        if (!this._pools.has(name)) this._pools.set(name, new Set());
    }

    public getSlot(name: string): Node {
        const pool = this._pools.get(name);
        if (!pool) return null;

        if (pool.size > 0) {
            const iterator = pool.values();
            const slot = iterator.next().value;
            this._markAsActive(name, slot);
            return slot;
        }

        const prefab = this._prefabs.get(name);
        if (prefab) {
            const newNode = instantiate(prefab);
            (newNode as any)._slotKey = name;
            return newNode;
        }
        return null;
    }

    public recycleSlot(slot: Node): void {
        const name = (slot as any)._slotKey;
        if (name && this._pools.has(name)) {
            this._markAsInactive(name, slot);
        } else {
            slot.destroy();
        }
    }

    private _markAsActive(name: string, slot: Node): void {
        slot.active = true;
        this._pools.get(name).delete(slot);
    }

    private _markAsInactive(name: string, slot: Node): void {
        slot.active = false;
        this._pools.get(name).add(slot);
    }
}