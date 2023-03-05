import React from "react";
import { BoxProps } from "@mui/system";

import TSubject from "../../../model/TSubject";

import ICardViewOperation from "./ICardViewOperation";
import ICardViewAction from "./ICardViewAction";
import IItemData from "./IItemData";

export interface ICardViewProps<ItemData extends IItemData = any> extends BoxProps {
    handler: ItemData[] | ((search: string, skip: number) => (ItemData[] | Promise<ItemData[]>));
    scrollXSubject?: TSubject<number>;
    scrollYSubject?: TSubject<number>;
    reloadSubject?: TSubject<void>;
    cardActions?: ICardViewAction<ItemData>[];
    operations?: ICardViewOperation<ItemData>[];
    formatKey?: (key: keyof ItemData) => React.ReactNode;
    formatValue?: (key: keyof ItemData, value: ItemData[keyof ItemData]) => React.ReactNode;
    onOperation?: (operation: string, selectedItems: ItemData[], isAllSelected: boolean) => (void | Promise<void>);
    onAction?: (action: string, item: ItemData) => void;
    onCardClick?: (item: ItemData) => void;
    onLoadStart?: () => void;
    onLoadEnd?: (isOk: boolean) => void;
    fallback?: (e: Error) => void;
    skipStep?: number;
    throwError?: boolean;
    noSearch?: boolean;
}

export default ICardViewProps;
