import { useState, useEffect } from 'react';

import Model from "../utils/mvvm/Model";

import useActualCallback from './useActualCallback';

interface IParams<T extends {} = any> {
    initialValue: T | Model<T> | (() => T);
    onChange?: (item: Model<T>) => void;
}

export const useModel = <T extends {} = any>({
    initialValue,
    onChange = () => null,
}: IParams<T>) => {
    const [model, setModel] = useState(() => new Model(initialValue));
    const handleChange = useActualCallback(onChange);
    useEffect(() => model.handleChange((model) => {
        const newModel = new Model(model);
        setModel(newModel);
        handleChange(newModel);
    }), [model]);
    return model;
};

export default useModel;
