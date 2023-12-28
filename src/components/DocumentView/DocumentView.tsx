import * as React from 'react';
import { useState } from 'react';

import { makeStyles } from '../../styles';
import { darken } from '@mui/material';

import Box, { BoxProps } from '@mui/material/Box';

import { AutoSizer } from '../AutoSizer';

import ActionFab from '../ActionFab';

import FullscreenIcon from '@mui/icons-material/Fullscreen';
import DeleteIcon from '@mui/icons-material/Delete';

import { ActionMenu, IActionMenuProps } from '../ActionMenu';

import classNames from '../../utils/classNames';
import openBlank from '../../utils/openBlank';

const FAB_SIZE = 48;

interface IDocumentViewProps<T extends any = object> extends BoxProps, Omit<IActionMenuProps<T>, keyof {
    className: never;
    style: never;
    sx: never;
    transparent: never;
    onToggle: never;
}> {
    withFullScreen?: boolean;
    withDelete?: boolean;
    className?: string;
    style?: React.CSSProperties;
    src: string;
    onFullScreenClick?: () => (Promise<void> | void);
    onDeleteClick?: () => (Promise<void> | void);
    onLoadStart?: () => void;
    onLoadEnd?: (isOk: boolean) => void;
    fallback?: (e: Error) => void;
    throwError?: boolean;
}

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'relative',
        overflow: 'hidden',
        background: theme.palette.mode === 'light'
            ? theme.palette.background.paper
            : darken(theme.palette.background.paper, 0.06),
    },
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        minHeight: '100%',
        minWidth: '100%',
    },
    frame: {
        background: 'none transparent',
        border: '0px solid transparent',
    },
    fabFullscreen: {
        position: 'absolute',
        transition: 'opacity 150ms',
        opacity: 0,
        bottom: 10,
        right: 10,
        zIndex: 2,
    },
    fabFullscreenToggle: {
        opacity: 1,
    },
    fabDelete: {
        position: 'absolute',
        transition: 'opacity 150ms',
        opacity: 0,
        bottom: 10,
        zIndex: 2,
    },
    fabDeleteToggle: {
        opacity: 1,
    },
    fabMenu: {
        position: 'absolute',
        transition: 'opacity 150ms',
        opacity: 0,
        top: 10,
        right: 10,
        height: FAB_SIZE,
        width: FAB_SIZE,
        zIndex: 2,
    },
    fabMenuToggle: {
        opacity: 1,
    },
}));

export const DocumentView = ({
    withFullScreen = false,
    withDelete = false,
    className,
    style,
    src,
    onFullScreenClick = () => openBlank(src),
    onDeleteClick = () => undefined,
    onLoadStart,
    onLoadEnd,
    fallback,
    throwError = false,
    disabled = false,

    options,
    onAction = () => undefined,
    payload,
    deps,
    keepMounted,
    BeforeContent,
    AfterContent,

    ...otherProps
}: IDocumentViewProps) => {
    const { classes } = useStyles();

    const [toggle, setToggle] = useState(false);
    const [hover, setHover] = useState(false);

    return (
        <Box
            className={classNames(className, classes.root)}
            onMouseEnter={() => {
                if (toggle) {
                    return;
                }
                setHover(true);
            }}
            onMouseLeave={() => {
                if (toggle) {
                    return;
                }
                setHover(false);
            }}
            {...otherProps}
        >
            <AutoSizer className={classes.container} payload={src}>
                {({
                    height,
                    width,
                    payload,
                }) => (
                    <iframe
                        className={classes.frame}
                        allowTransparency
                        src={payload}
                        height={height}
                        width={width}
                    />
                )}
            </AutoSizer>
            {!!options?.length && (
                <ActionMenu
                    className={classNames(classes.fabMenu, {
                        [classes.fabMenuToggle]: toggle || hover,
                    })}
                    options={options}
                    disabled={disabled}
                    onToggle={(toggle) => {
                        setToggle(toggle);
                        setHover(false);
                    }}
                    onAction={onAction}
                    payload={payload}
                    deps={deps}
                    keepMounted={keepMounted}
                    BeforeContent={BeforeContent}
                    AfterContent={AfterContent}
                />
            )}
            {withDelete && (
                <ActionFab
                    className={classNames(classes.fabDelete, {
                        [classes.fabDeleteToggle]: toggle || hover,
                    })}
                    disabled={disabled}
                    sx={{
                        right: withFullScreen ? 68 : 10,
                    }}
                    color="primary"
                    size={FAB_SIZE}
                    onClick={onDeleteClick}
                    onLoadStart={onLoadStart}
                    onLoadEnd={onLoadEnd}
                    fallback={fallback}
                    throwError={throwError}
                >
                    <DeleteIcon color="inherit" />
                </ActionFab>
            )}
            {withFullScreen && (
                <ActionFab
                    className={classNames(classes.fabFullscreen, {
                        [classes.fabFullscreenToggle]: toggle || hover,
                    })}
                    disabled={disabled}
                    color="primary"
                    size={FAB_SIZE}
                    onClick={onFullScreenClick}
                    onLoadStart={onLoadStart}
                    onLoadEnd={onLoadEnd}
                    fallback={fallback}
                    throwError={throwError}
                >
                    <FullscreenIcon color="inherit" />
                </ActionFab>
            )}
        </Box>
    );
};

export default DocumentView;
