import * as React from "react";

import { SxProps } from "@mui/material";

import IScaffold2Group, { IScaffold2GroupInternal } from "./IScaffold2Group";
import IScaffold2Action from "./IScaffold2Action";
import Payload from "./Payload";

/**
 * Represents the properties of the IScaffold2 component.
 */
export interface IScaffold2Props<T = Payload> {
    noOptionHover?: boolean;
    noContent?: boolean;
    noAppName?: boolean;
    fixedHeader?: boolean;
    noSearch?: boolean;
    dense?: boolean;
    className?: string;
    style?: React.CSSProperties;
    sx?: SxProps<any>;
    appName?: string;
    options: IScaffold2Group<T>[];
    actions?: IScaffold2Action<T>[];
    loading?: boolean | number;
    payload?: T;
    deps?: any[];
    activeOptionPath: string;
    activeTabPath?: string;
    AfterAppName?: React.ComponentType<any>;
    BeforeActionMenu?: React.ComponentType<any>;
    BeforeSearch?: React.ComponentType<any>;
    AfterSearch?: React.ComponentType<any>;
    BeforeMenuContent?: React.ComponentType<any>;
    AfterMenuContent?: React.ComponentType<any>;
    BeforeContent?: React.ComponentType<any>;
    AfterContent?: React.ComponentType<any>;
    Copyright?: React.ComponentType<any>;
    onAction?: (name: string) => void;
    onOptionClick?: (path: string, id: string) => undefined | boolean;
    onOptionGroupClick?: (path: string, id: string) => undefined | boolean;
    onTabChange?: (path: string, tab: string, id: string) => void;
    children: React.ReactNode;
    onInit?: () => (void | Promise<void>);
    onLoadStart?: () => void;
    onLoadEnd?: (isOk: boolean) => void;
    fallback?: (e: Error) => void;
    throwError?: boolean;
    disableBackdropTransition?: boolean;
    disableDiscovery?: boolean;
    disableSwipeToOpen?: boolean;
    swipeAreaWidth?: number;
}

export interface IScaffold2InternalProps<T = Payload> extends Omit<IScaffold2Props<T>, keyof {
    options: never;
}> {
    options: IScaffold2GroupInternal<T>[];
}

export default IScaffold2Props;
