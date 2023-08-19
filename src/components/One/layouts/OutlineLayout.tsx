import * as React from "react";

import { makeStyles } from "../../../styles";

import Group, { IGroupProps } from "../../../components/common/Group";
import Outline, { IOutlineProps } from '../../../components/common/Outline';

import classNames from "../../../utils/classNames";

import { PickProp } from "../../../model/IManaged";
import IAnything from "../../../model/IAnything";
import IField from "../../../model/IField";

import makeLayout from "../components/makeLayout/makeLayout";

export interface IOutlineLayoutProps<Data = IAnything, Payload = IAnything> extends IOutlineProps<Data, Payload>, IGroupProps<Data, Payload> {
  innerPadding?: PickProp<IField<Data, Payload>, 'innerPadding'>;
}

interface IOutlineLayoutPrivate {
  children?: React.ReactNode;
}

const useStyles = makeStyles()({
  root: {
    position: "relative",
    display: "flex",
    alignItems: "stretch",
    justifyContent: "stretch",
  },
  content: {
    flexGrow: 1,
    width: "100%",
  },
});

export const OutlineLayout = <Data extends IAnything = IAnything>({
  columns,
  columnsOverride,
  sx,
  phoneColumns,
  tabletColumns,
  desktopColumns,
  style,
  className,
  children,
  fieldRightMargin = '0',
  fieldBottomMargin = '0',
  innerPadding: padding = '18px',
}: IOutlineLayoutProps<Data> & IOutlineLayoutPrivate) => {
  const { classes } = useStyles();
  return (
    <Group
      className={classNames(className, classes.root)}
      style={style}
      isItem={true}
      columns={columns}
      phoneColumns={phoneColumns}
      tabletColumns={tabletColumns}
      desktopColumns={desktopColumns}
      fieldRightMargin={fieldRightMargin}
      fieldBottomMargin={fieldBottomMargin}
    >
      <Outline
        className={classes.content}
        columnsOverride={columnsOverride}
        style={{ padding }}
        sx={sx}
      >
        {children}
      </Outline>
    </Group>
  );
};

OutlineLayout.displayName = 'OutlineLayout';

export default makeLayout(OutlineLayout) as typeof OutlineLayout;
