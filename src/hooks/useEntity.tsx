import { useState, useEffect } from 'react';

import Entity, { IEntity, REFRESH_SYMBOL, CHANGE_DEBOUNCE } from "../utils/mvvm/Entity";

import useActualCallback from './useActualCallback';

export interface IParams<T extends IEntity = any> {
    initialValue: T | Entity<T> | (() => T);
    onChange?: (item: Entity<T>) => void;
    debounce?: number;
}

export const useEntity = <T extends IEntity = any>({
    initialValue,
    onChange = () => null,
    debounce = CHANGE_DEBOUNCE,
}: IParams<T>) => {
    const [entity, setEntity] = useState(() => new Entity(initialValue, debounce));
    const handleChange = useActualCallback(onChange);
    useEffect(() => entity.handleChange((entity) => {
        const newEntity = new Entity(entity, debounce);
        setEntity(newEntity);
        handleChange(newEntity);
    }), [entity]);
    useEffect(() => entity.once(REFRESH_SYMBOL, (entity) => {
        const newEntity = new Entity(entity, debounce);
        setEntity(newEntity);
        handleChange(newEntity);
    }), [entity]);
    return entity;
};

export default useEntity;
