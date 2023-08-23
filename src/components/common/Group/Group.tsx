import * as React from "react";
import { forwardRef } from "react";

import { makeStyles } from "../../../styles";

import { IManagedLayout, PickProp } from "../../../model/IManaged";
import IAnything from "../../../model/IAnything";
import IField from "../../../model/IField";

import classNames from '../../../utils/classNames';

import Item from "./Item";
import Container from "./Container";

export interface IGroupProps<Data = IAnything, Payload = IAnything> extends IManagedLayout<Data, Payload> {
  style?: PickProp<IField<Data, Payload>, 'style'>;
  className?: PickProp<IField<Data, Payload>, 'className'>;
}

interface IGroupPrivate {
  children: React.ReactNode;
  isItem?: boolean;
  isWrapper?: boolean;
  onFocus?: () => void;
}

const useStyles = makeStyles()({
  root: {
    position: "relative",
    '& > *': {
      width: '100%',
    },
  },
});

export const Group = (
  {
    className = "",
    columns = "",
    phoneColumns = "",
    tabletColumns = "",
    desktopColumns = "",
    children,
    isItem,
    isWrapper,
    style,
    columnsOverride,
    sx,
    fieldRightMargin = '1',
    fieldBottomMargin = '2',
    onFocus,
  }: IGroupProps & IGroupPrivate,
  ref: React.Ref<HTMLDivElement>
) => {
  const { classes } = useStyles();
  if (isItem) {
    return (
      <Item
        ref={ref}
        className={classNames(classes.root, className)}
        style={style}
        columns={columns}
        phoneColumns={phoneColumns}
        tabletColumns={tabletColumns}
        desktopColumns={desktopColumns}
        fieldRightMargin={fieldRightMargin}
        fieldBottomMargin={fieldBottomMargin}
        onFocus={onFocus}
        sx={sx}
      >
        {children}
      </Item>
    );
  } else {
    return (
      <Container
        ref={ref}
        className={classNames(classes.root, className)}
        isWrapper={isWrapper}
        columnsOverride={columnsOverride}
        style={style}
        onFocus={onFocus}
        sx={sx}
      >
        {children}
      </Container>
    );
  }
};

Group.displayName = 'Group';

export default forwardRef(Group);
