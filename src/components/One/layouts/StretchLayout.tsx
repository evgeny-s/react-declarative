import * as React from 'react';

import { makeStyles } from '../../../styles';

import classNames from '../../../utils/classNames';

import IField from '../../../model/IField';
import IEntity from '../../../model/IEntity';
import IAnything from '../../../model/IAnything';
import { IWrappedLayout, PickProp } from '../../../model/IManaged';

import makeLayout from '../components/makeLayout/makeLayout';

export interface IStretchLayoutProps<Data = IAnything, Payload = IAnything> extends IWrappedLayout<Data> {
    innerPadding?: PickProp<IField<Data, Payload>, 'innerPadding'>;
    className?: PickProp<IField<Data, Payload>, 'className'>;
    style?: PickProp<IField<Data, Payload>, 'style'>;
}

interface IStretchLayoutPrivate<Data = IAnything> extends IEntity<Data> {
    children?: React.ReactNode;
}

const useStyles = makeStyles()({
    root: {
        position: 'relative',
        overflowY: 'auto',
        width: '100%',
        height: '100%',
        flex: 1,
    },
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        minHeight: '100%',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'stretch',
        flexDirection: 'column',
        '& > *': {
            flex: 1,
        },
    },
});

export const StretchLayout = <Data extends IAnything = IAnything>({
    children,
    className,
    style,
    innerPadding: padding = '0px',
}: IStretchLayoutProps<Data> & IStretchLayoutPrivate<Data>) => {
    const { classes } = useStyles();
    return (
        <div className={classNames(classes.root, className)} style={style}>
            <div className={classes.container} style={{ padding }}>
                {children}
            </div>
        </div>
    );    
};

StretchLayout.displayName = 'StretchLayout';

export default makeLayout(StretchLayout) as typeof StretchLayout;
