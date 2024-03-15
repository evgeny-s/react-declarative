// import { makeObservable } from 'mobx';
// import { observable, computed, action } from 'mobx';

import EventEmitter from '../rx/EventEmitter';
import Subject from '../rx/Subject';

import debounce from '../hof/debounce';

import Entity, { IEntity, CHANGE_SYMBOL, CHANGE_DEBOUNCE, REFRESH_SYMBOL, IEntityAdapter } from './Entity';

export const REORDER_SYMBOL = Symbol('reorder');

/**
 * An interface representing a collection adapter.
 * @template T - The type of entities in the collection.
 */
export interface ICollectionAdapter<T extends IEntity = any> {
    items: IEntityAdapter<T>[];
    lastIdx: number;
    ids: IEntity['id'][];
    isEmpty: boolean;
    setData(items: T[]): void;
    map<V = any>(callbackfn: (value: IEntityAdapter<T>, idx: number) => V): V[];
    filter(predicate: (value: IEntityAdapter<T>, idx: number) => boolean): IEntityAdapter<T>[];
    find(predicate: (value: IEntityAdapter<T>, idx: number) => boolean): IEntityAdapter<T> | undefined;
    some(predicate: (value: IEntityAdapter<T>, idx: number) => boolean): boolean;
    forEach(callbackfn: (value: IEntityAdapter<T>, idx: number) => void): void;
    push(...items: (T[] | T[][])): void;
    upsert(...items: (T[] | T[][])): void;
    remove(item: IEntity): void;
    removeById(id: IEntity['id']): void;
    removeAll(): void;
    findById(id: IEntity['id']): IEntityAdapter<T>;
    clear(): void;
    refresh(): void;
    toArray(): T[];
}

export class EntityNotFoundError extends Error {
};

/**
 * @description MVVM Array wrapper. Emmits `change` after push/pop/change of element
 */
export class Collection<T extends IEntity = any> extends EventEmitter implements ICollectionAdapter<T> {

    private readonly _items = new Map<number, Entity<T>>();
    private readonly _ids = new Map<IEntity['id'], number>();

    private _dropChanges = new Subject<void>();

    public get items(): Entity<T>[] {
        return [...this._items.entries()]
            .sort(([a], [b]) => Number(a) - Number(b))
            .map((value) => value[1]);
    };

    get lastIdx() {
        return Math.max(...this._items.keys(), -1) + 1;
    };

    public get ids() {
        return [...this._ids.keys()];
    };

    private _prevEntity = (initialData: T) => (): T => {
        const items = this._prevData();
        const prevEntity = items.find((item) => item.id === initialData.id);
        if (prevEntity) {
            return prevEntity.data;
        } else {
            return initialData;
        }
    };

    private _change = (target: Entity<T>) => {
        this.emit(CHANGE_SYMBOL, this, target);
    };

    private _refresh = (target: Entity<T>) => {
        this.emit(REFRESH_SYMBOL, this, target);
    };

    private _reorder = () => {
        this.emit(REORDER_SYMBOL, this, null);
    };

    private _dispose = () => {
        for (const entity of this._items.values()) {
            entity.unsubscribe(CHANGE_SYMBOL, this._change);
            entity.unsubscribe(REFRESH_SYMBOL, this._refresh);
        }
        this._items.clear();
        this._ids.clear();
    };

    constructor(entities: T[] | (() => T[]) | Entity<T>[] | Collection<T> = [], protected _debounce = CHANGE_DEBOUNCE, protected _prevData = () => this.items) {
        super();
        if (entities instanceof Collection) {
            const { items } = entities;
            entities._dispose();
            entities = items;
        } else if (typeof entities === 'function') {
            entities = entities().map((data) => new Entity<T>(data, this._debounce, this._prevEntity(data)));
        } else {
            entities = entities.map((e) => {
                if (e instanceof Entity) {
                    e = e.data;
                }
                return new Entity<T>(e, this._debounce, this._prevEntity(e));
            });
        }
        entities.forEach((entity, idx) => {
            this._items.set(idx, entity);
            this._ids.set(entity.id, idx);
            entity.subscribe(CHANGE_SYMBOL, this._change);
            entity.subscribe(REFRESH_SYMBOL, this._refresh);
        });
        /*makeObservable(this, {
            _items: observable,
            items: computed,
            isEmpty: computed,
            setData: action('Collection setData'),
            setRawData: action('Collection setRawData'),
            clear: action('Collection clear'),
            push: action('Collection push'),
            remove: action('Collection remove'),
            removeById: action('Collection removeById'),
        });*/
    };

    public get isEmpty() {
        return this._items.size === 0;
    };

    public setData = (items: T[]) => {
        this._dispose();
        for (let i = 0; i !== items.length; i++) {
            const item = items[i];
            const entity = new Entity<T>(item, this._debounce, this._prevEntity(item));
            this._items.set(i, entity);
            this._ids.set(entity.id, i);
            entity.subscribe(CHANGE_SYMBOL, this._change);
            entity.subscribe(REFRESH_SYMBOL, this._refresh);
        };
        this._reorder();
    };

    public clear = () => {
        this._dispose();
        this._reorder();
    };

    public map = <V = any>(callbackfn: (value: Entity<T>, idx: number) => V) => {
        return this.items.map(callbackfn);
    };

    public filter = (predicate: (value: Entity<T>, idx: number) => boolean) => {
        return this.items.filter(predicate);
    };

    public find = (predicate: (value: Entity<T>, idx: number) => boolean) => {
        return this.items.find(predicate);
    };

    public some = (predicate: (value: Entity<T>, idx: number) => boolean) => {
        return this.items.some(predicate);
    };

    public forEach = (callbackfn: (value: Entity<T>, idx: number) => void) => {
        return this.items.forEach(callbackfn);
    };

    public push = (...items: (T[] | T[][])) => {
        const itemList = items.flat() as T[];
        const lastIdx = this.lastIdx;
        for (let i = 0; i !== itemList.length; i++) {
            const pendingIdx = lastIdx + i;
            const item = itemList[i];
            if (item.id === undefined) {
                item.id = pendingIdx;
            }
            const entity = new Entity<T>(item, this._debounce, this._prevEntity(item));
            this._items.set(pendingIdx, entity);
            this._ids.set(entity.id, pendingIdx);
            entity.subscribe(CHANGE_SYMBOL, this._change);
            entity.subscribe(REFRESH_SYMBOL, this._refresh);
        }
        this._reorder();
    };

    public upsert = (...items: T[] | T[][]) => {
        const itemList = items.flat() as T[];
        const itemMap = new Map(itemList.map((item) => [item.id, item]));
        const updateSet = new Set<T["id"]>();
        for (const currentItem of this._items.values()) {
            const pendingItem = itemMap.get(currentItem.id);
            if (pendingItem) {
                currentItem.setData(pendingItem);
                updateSet.add(currentItem.id);
            }
        }
        this.push(...itemList.filter(({ id }) => !updateSet.has(id)))
    };

    public remove = (item: IEntity) => {
        this.removeById(item.id);
    };

    public removeById = (id: IEntity['id']) => {
        for (const [key, value] of this._items.entries()) {
            if (value.id === id) {
                this._items.delete(key);
                this._ids.delete(id);
                value.unsubscribe(CHANGE_SYMBOL, this._change);
                value.unsubscribe(REFRESH_SYMBOL, this._refresh);
                this._reorder();
                return;
            }
        }
        throw new EntityNotFoundError(`removeById unknown entity id ${id}`);
    };

    public removeAll = () => {
        for (const [key, value] of this._items.entries()) {
            this._items.delete(key);
            this._ids.delete(value.id);
            value.unsubscribe(CHANGE_SYMBOL, this._change);
            value.unsubscribe(REFRESH_SYMBOL, this._refresh);
        }
        this._reorder();
    };

    public findById = (id: IEntity['id']) => {
        if (this._ids.has(id)) {
            const idx = this._ids.get(id)!;
            return this._items.get(idx)!;
        }
        throw new EntityNotFoundError(`findById unknown entity id ${id}`);
    };

    public handleChange = (change: (collection: Collection<T>, target: Entity<T> | null) => void) => {
        const fn = debounce(change, this._debounce);
        const drop = this._dropChanges.subscribe(fn.clear);
        this.subscribe(CHANGE_SYMBOL, fn);
        this.subscribe(REFRESH_SYMBOL, change);
        this.subscribe(REORDER_SYMBOL, change);
        return () => {
            this.unsubscribe(CHANGE_SYMBOL, fn);
            this.unsubscribe(REFRESH_SYMBOL, change);
            this.unsubscribe(REORDER_SYMBOL, change);
            fn.clear();
            drop();
        };
    };

    public handleDropChanges = () => {
        for (const entity of this._items.values()) {
            entity.handleDropChanges();
        }
        this._dropChanges.next();
    };

    public refresh = () => this.emit(REFRESH_SYMBOL, this, null);

    public toArray = () => this.map((item) => item.toObject());

};

export default Collection;
