import * as React from "react";

import { makeStyles } from "../../../styles";

import Group, { IGroupProps } from "../../../components/common/Group";

import classNames from "../../../utils/classNames";

import IAnything from "../../../model/IAnything";

import makeLayout from "../components/makeLayout/makeLayout";

export interface IGroupLayoutProps<Data = IAnything, Payload = IAnything> extends IGroupProps<Data, Payload> {}

interface IGroupLayoutPrivate {
  isBaselineAlign: boolean;
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

export const GroupLayout = <Data extends IAnything = IAnything>({
  columns,
  columnsOverride,
  sx,
  phoneColumns,
  tabletColumns,
  desktopColumns,
  isBaselineAlign,
  fieldRightMargin = '0',
  fieldBottomMargin = '0',
  style,
  className,
  children,
}: IGroupLayoutProps<Data> & IGroupLayoutPrivate) => {
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
          <Group
            className={classes.content}
            isBaselineAlign={isBaselineAlign}
            columnsOverride={columnsOverride}
            sx={sx}
          >
            {children}
          </Group>
        </Group>
    );
};

GroupLayout.displayName = 'GroupLayout';

export default makeLayout(GroupLayout) as typeof GroupLayout;
