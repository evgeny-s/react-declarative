import * as React from 'react';
import { useEffect } from 'react';

import If from '../../If';

import IField from '../../../model/IField';
import IEntity from '../../../model/IEntity';
import IAnything from '../../../model/IAnything';
import { PickProp } from '../../../model/IManaged';

export interface IConditionLayoutProps<Data = IAnything> {
    condition?: PickProp<IField<Data>, 'condition'>;
}

interface IConditionLayoutPrivate<Data = IAnything> extends IEntity<Data> {
    children: React.ReactChild;
    fallback: PickProp<IEntity<Data>, 'fallback'>;
    ready: PickProp<IEntity<Data>, 'ready'>;
    object: PickProp<IEntity<Data>, 'object'>;
}

/**
 * Компоновка, которую можно скрыть, используя condition.
 * В отличие от isVisible умеет приходовать промис
 * Потомки передаются насквозь...
 */
export const ConditionLayout = <Data extends IAnything = IAnything>({
    children,
    condition = () => true,
    fallback = (e: Error) => {
        throw e;
    },
    object,
    ready,
}: IConditionLayoutProps<Data> & IConditionLayoutPrivate<Data>) => {

    useEffect(() => {
        ready();
    }, [object]);

    return (
        <If
            condition={condition}
            fallback={fallback}
            payload={object}
        >
            {children}
        </If>
    );
};

ConditionLayout.displayName = 'ConditionLayout';

export default ConditionLayout;
