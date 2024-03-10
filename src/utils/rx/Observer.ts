import EventEmitter from "./EventEmitter";

import TObserver from "../../model/TObserver";

import compose from '../compose';
import queued from "../hof/queued";
import debounce from "../hof/debounce";
import { CANCELED_SYMBOL } from "../hof/cancelable";

const OBSERVER_EVENT = Symbol('observer-subscribe');

const CONNECT_EVENT = Symbol('observer-connect');
const DISCONNECT_EVENT = Symbol('observer-disconnect');

export const LISTEN_CONNECT = Symbol('observer-connect-listen');
export const LISTEN_DISCONNECT = Symbol('observer-disconnect-listen');

type Fn = (...args: any[]) => void;

export class Observer<Data = any> implements TObserver<Data> {

    private readonly broadcast = new EventEmitter();
    private _isShared = false;

    public get isShared() {
        return this._isShared;
    };

    public get hasListeners() {
        return !!this.broadcast.getListeners(OBSERVER_EVENT).length;
    };

    constructor(private readonly dispose: Fn) { }

    [LISTEN_CONNECT](fn: () => void) {
        this.broadcast.once(CONNECT_EVENT, fn);
    };

    [LISTEN_DISCONNECT](fn: () => void) {
        this.broadcast.once(DISCONNECT_EVENT, fn);
    };

    private _subscribe = <T = any>(observer: TObserver<T>, callback: Fn) => {
        this.broadcast.subscribe(OBSERVER_EVENT, callback);
        observer[LISTEN_CONNECT](() => {
            this.broadcast.emit(CONNECT_EVENT);
        });
        observer[LISTEN_DISCONNECT](() => {
            if (!this.hasListeners) {
                this.broadcast.emit(DISCONNECT_EVENT);
            }
        });
    };

    private _unsubscribe = (callback: Fn) => {
        this.broadcast.unsubscribe(OBSERVER_EVENT, callback);
    };

    private tryDispose =  () => {
        if (!this.hasListeners && !this._isShared) {
            this.dispose();
            this.broadcast.emit(DISCONNECT_EVENT);
        }
    };

    public map = <T = any>(callbackfn: (value: Data) => T): Observer<T> => {
        let unsubscribeRef: Fn;
        const dispose = compose(
            () => this.tryDispose(),
            () => unsubscribeRef(),
        );
        const observer = new Observer<T>(dispose);
        const handler = (value: Data) => {
            const pendingValue = callbackfn(value);
            observer.emit(pendingValue);
        };
        this._subscribe(observer, handler);
        unsubscribeRef = () => this._unsubscribe(handler);
        return observer;
    };

    public flatMap = <T = any>(callbackfn: (value: Data) => T[]): Observer<T> => {
        let unsubscribeRef: Fn;
        const dispose = compose(
            () => this.tryDispose(),
            () => unsubscribeRef(),
        );
        const observer = new Observer<T>(dispose);
        const handler = (value: Data) => {
            const pendingValue = callbackfn(value);
            if (Array.isArray(pendingValue)) {
                pendingValue.forEach((value) => {
                    observer.emit(value);
                });
            } else {
                observer.emit(pendingValue);
            }
        };
        this._subscribe(observer, handler);
        unsubscribeRef = () => this._unsubscribe(handler);
        return observer;
    };

    public operator = <T = any>(callbackfn: (target: TObserver<Data>) => TObserver<T>): TObserver<T> => {
        return callbackfn(this);
    };

    public reduce = <T = any>(callbackfn: (acm: T, cur: Data) => T, begin: T): Observer<T> => {
        let unsubscribeRef: Fn;
        let acm: T = begin;
        const dispose = compose(
            () => this.tryDispose(),
            () => unsubscribeRef(),
        );
        const observer = new Observer<T>(dispose);
        const handler = (value: Data) => {
            const pendingValue = callbackfn(acm, value);
            acm = pendingValue;
            observer.emit(pendingValue);
        };
        this._subscribe(observer, handler);
        unsubscribeRef = () => this._unsubscribe(handler);
        return observer;
    };

    public split = (): Observer<ReadonlyArray<FlatArray<Data[], 20>>> => {
        let unsubscribeRef: Fn;
        const dispose = compose(
            () => this.tryDispose(),
            () => unsubscribeRef(),
        );
        const observer = new Observer(dispose);
        const handler = (data: Data) => {
            if (Array.isArray(data)) {
                data.flat(Number.POSITIVE_INFINITY).forEach((item) => {
                    observer.emit(item);
                });
            } else {
                observer.emit(data);
            }
        };
        this._subscribe(observer, handler);
        unsubscribeRef = () => this._unsubscribe(handler);
        return observer;
    };

    public mapAsync = <T = any>(callbackfn: (value: Data) => Promise<T>, fallbackfn?: (e: Error) => void): Observer<T> => {
        let unsubscribeRef: Fn;
        const dispose = compose(
            () => this.tryDispose(),
            () => unsubscribeRef(),
        );
        const observer = new Observer<T>(dispose);
        const iteraction = queued(callbackfn);
        const handler = async (value: Data) => {
            try {
                const pendingValue = await iteraction(value);
                if (pendingValue !== CANCELED_SYMBOL) {
                    observer.emit(pendingValue);
                }
            } catch (e: any) {
                if (fallbackfn) {
                    fallbackfn(e);
                } else {
                    throw e;
                }
            }
        };
        this._subscribe(observer, handler);
        unsubscribeRef = compose(
            () => this._unsubscribe(handler),
            () => iteraction.clear(),
        );
        return observer;
    };

    public filter = (callbackfn: (value: Data) => boolean): Observer<Data> => {
        let unsubscribeRef: Fn;
        const dispose = compose(
            () => this.tryDispose(),
            () => unsubscribeRef(),
        );
        const observer = new Observer<Data>(dispose);
        const handler = (value: Data) => {
            const delegate = callbackfn(value);
            if (delegate) {
                observer.emit(value);
            }
        };
        this._subscribe(observer, handler);
        unsubscribeRef = () => this._unsubscribe(handler);
        return observer;
    };

    public tap = (callbackfn: (value: Data) => void): Observer<Data> => {
        let unsubscribeRef: Fn;
        const dispose = compose(
            () => this.tryDispose(),
            () => unsubscribeRef(),
        );
        const observer = new Observer<Data>(dispose);
        const handler = (value: Data) => {
            callbackfn(value);
            observer.emit(value);
        };
        this._subscribe(observer, handler);
        unsubscribeRef = () => this._unsubscribe(handler);
        return observer;
    };

    public debounce = (delay?: number): Observer<Data> => {
        let unsubscribeRef: Fn;
        const dispose = compose(
            () => this.tryDispose(),
            () => unsubscribeRef(),
        );
        const observer = new Observer<Data>(dispose);
        const handler = debounce((value: Data) => {
            observer.emit(value);
        }, delay);
        this._subscribe(observer, handler);
        unsubscribeRef = compose(
            () => handler.clear(),
            () => this._unsubscribe(handler),
        );
        return observer;
    };

    public emit = (data: Data) => {
        this.broadcast.emit(OBSERVER_EVENT, data);
    };

    public connect = (callbackfn: (value: Data) => void) => { 
        this.broadcast.subscribe(OBSERVER_EVENT, callbackfn);
        this.broadcast.emit(CONNECT_EVENT);
        return compose(
            () => this.tryDispose(),
            () => this._unsubscribe(callbackfn),
        );
    };

    public once = (callbackfn: (value: Data) => void) => { 
        let unsubscribeRef: Fn;
        const handler = (value: Data) => {
            callbackfn(value);
            unsubscribeRef();
        };
        unsubscribeRef = this.connect(handler);
        return unsubscribeRef;
    };

    public share = () => {
        this._isShared = true;
        return this;
    };

    public repeat = (interval = 1_000) => {
        let unsubscribeRef: Fn;
        let timeout: number;
        const dispose = compose(
            () => this.tryDispose(),
            () => unsubscribeRef(),
            () => timeout !== undefined && clearTimeout(timeout),
        );
        const observer = new Observer<Data>(dispose);
        const handler = (value: Data) => {
            if (timeout !== undefined) {
                clearTimeout(timeout);
            }
            observer.emit(value);
            if (this.hasListeners) {
                timeout = setTimeout(handler, interval, value);
            }
        };
        this._subscribe(observer, handler);
        unsubscribeRef = () => this._unsubscribe(handler);
        return observer;
    };

    public merge = <T = any>(observer: TObserver<T>): Observer<Data | T>  => {
        let unsubscribeRef: Fn;
        const dispose = compose(
            () => this.tryDispose(),
            () => unsubscribeRef(),
        );
        const merged = new Observer<Data | T>(dispose);
        const handler = (value: Data | T) => {
            merged.emit(value);
        };
        this._subscribe(merged, handler);
        let unsubscribe: Fn = () => undefined;
        merged[LISTEN_CONNECT](() => {
            unsubscribe = observer.connect(handler) || (() => undefined);
        });
        unsubscribeRef = compose(
            () => this._unsubscribe(handler),
            () => unsubscribe(),
        );
        return merged;
    };

    public unsubscribe = () => {
        this.broadcast.unsubscribeAll();
        this.broadcast.emit(DISCONNECT_EVENT);
        this.dispose();
    };

    public toPromise = () => new Promise<Data>((res) => {
        this.once((data) => res(data));
    });

    public toIteratorContext = () => { 
        const self = this;
        let isDone = false;
        const iterator = (async function* () {
            do {
                const next = await self.toPromise();
                yield next as Data;
            } while (!isDone);
        })();
        return {
            iterator,
            done() {
                isDone = true;
            },
        }
    };

};

export { TObserver };

export default Observer;
