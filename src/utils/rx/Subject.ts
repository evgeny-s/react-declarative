import EventEmitter from "./EventEmitter";

const SUBJECT_EVENT = Symbol('react-declarative-subject');

type Function = (...args: any[]) => void;

export class Subject<Data = any> {

    private emitter = new EventEmitter();

    subscribe = (callback: Function) => {
        this.emitter.subscribe(SUBJECT_EVENT, callback);
        return () => {
            this.emitter.unsubscribe(SUBJECT_EVENT, callback);
        }
    };

    once = (callback: Function) => {
        return this.emitter.once(SUBJECT_EVENT, callback);
    };

    next = (data: Data) => {
        this.emitter.emit(SUBJECT_EVENT, data);
    };

};

export default Subject;
