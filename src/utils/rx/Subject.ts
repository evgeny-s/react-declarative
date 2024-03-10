import EventEmitter from "./EventEmitter";
import Observer from "./Observer";

import TSubject from "../../model/TSubject";
import TObserver, { TObservable } from "../../model/TObserver";

export const SUBJECT_EVENT = Symbol('react-declarative-subject');

type Function = (...args: any[]) => void;

export class Subject<Data = any> implements TSubject<Data>, TObservable<Data> {

    private _emitter = new EventEmitter();

    constructor() {
        this.next = this.next.bind(this);
        this.toObserver = this.toObserver.bind(this);
        this.toIteratorContext = this.toIteratorContext.bind(this);
    };

    public map = <T = any>(callbackfn: (value: Data) => T): TObserver<T> => {
        let unsubscribeRef: Function;
        const observer = new Observer<Data>(() => unsubscribeRef());
        unsubscribeRef = this.subscribe(observer.emit);
        return observer.map(callbackfn);
    };

    public flatMap = <T = any>(callbackfn: (value: Data) => T[]): TObserver<T> => {
        let unsubscribeRef: Function;
        const observer = new Observer<Data>(() => unsubscribeRef());
        unsubscribeRef = this.subscribe(observer.emit);
        return observer.flatMap(callbackfn);
    };

    public reduce = <T = any>(callbackfn: (acm: T, cur: Data) => T, begin: T): TObserver<T> => {
        let unsubscribeRef: Function;
        const observer = new Observer<Data>(() => unsubscribeRef());
        unsubscribeRef = this.subscribe(observer.emit);
        return observer.reduce(callbackfn, begin);
    };

    public mapAsync = <T = any>(callbackfn: (value: Data) => Promise<T>, fallbackfn?: (e: Error) => void): TObserver<T> => {
        let unsubscribeRef: Function;
        const observer = new Observer<Data>(() => unsubscribeRef());
        unsubscribeRef = this.subscribe(observer.emit);
        return observer.mapAsync(callbackfn, fallbackfn);
    };

    public filter = (callbackfn: (value: Data) => boolean): TObserver<Data> => {
        let unsubscribeRef: Function;
        const observer = new Observer<Data>(() => unsubscribeRef());
        unsubscribeRef = this.subscribe(observer.emit);
        return observer.filter(callbackfn);
    };

    public tap = (callbackfn: (value: Data) => void): TObserver<Data> => {
        let unsubscribeRef: Function;
        const observer = new Observer<Data>(() => unsubscribeRef());
        unsubscribeRef = this.subscribe(observer.emit);
        return observer.tap(callbackfn);
    };

    public operator = <T = any>(callbackfn: (value: TObserver<Data>) => TObserver<T>): TObserver<T> => {
        let unsubscribeRef: Function;
        const observer = new Observer<Data>(() => unsubscribeRef());
        unsubscribeRef = this.subscribe(observer.emit);
        return observer.operator(callbackfn);
    };

    public split = (): Observer<ReadonlyArray<FlatArray<Data[], 20>>> => {
        let unsubscribeRef: Function;
        const observer = new Observer<Data>(() => unsubscribeRef());
        unsubscribeRef = this.subscribe(observer.emit);
        return observer.split();
    };

    public debounce = (delay?: number): TObserver<Data> => {
        let unsubscribeRef: Function;
        const observer = new Observer<Data>(() => unsubscribeRef());
        unsubscribeRef = this.subscribe(observer.emit);
        return observer.debounce(delay);
    };

    public repeat = (interval?: number): TObserver<Data> => {
        let unsubscribeRef: Function;
        const observer = new Observer<Data>(() => unsubscribeRef());
        unsubscribeRef = this.subscribe(observer.emit);
        return observer.repeat(interval);
    };

    public merge = <T = any>(observer: TObserver<T>): TObserver<Data | T> => {
        let unsubscribeRef: Function;
        const merged = new Observer<Data>(() => unsubscribeRef());
        unsubscribeRef = this.subscribe(merged.emit);
        return merged.merge(observer);
    };

    public subscribe = (callback: Function) => {
        this._emitter.subscribe(SUBJECT_EVENT, callback);
        return () => {
            this._emitter.unsubscribe(SUBJECT_EVENT, callback);
        }
    };

    public unsubscribeAll = () => {
        this._emitter.unsubscribeAll();
    };

    public once = (callback: Function) => {
        return this._emitter.once(SUBJECT_EVENT, callback);
    };

    public async next(data: Data) {
        await this._emitter.emit(SUBJECT_EVENT, data);
    };

    public toObserver(): TObserver<Data> {
        let unsubscribeRef: Function;
        const observer = new Observer<Data>(() => unsubscribeRef());
        unsubscribeRef = this.subscribe(observer.emit);
        return observer;
    };

    public toPromise = () => this.toObserver().toPromise();

    public toIteratorContext = () => this.toObserver().toIteratorContext();

};

export { TSubject };

export default Subject;
