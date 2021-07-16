import * as React from 'react';
import { Fragment } from 'react';
import { makeStyles } from '@material-ui/core';

import classNames from '../../../../utils/classNames';

import { IListAction } from '../../../../model/IListProps';
import ActionType from '../../../../model/ActionType';
import IAnything from '../../../../model/IAnything';

import ActionMenu from './components/ActionMenu';
import ActionAdd from './components/ActionAdd';

const useStyles = makeStyles({
  root: {
    display: "flex",
    alignItems: "center",
    justifyContent: "stretch",
    height: 60,
    gap: 5,
  },
  stretch: {
    flex: 1,
  },
  noData: {
    maxHeight: 0,
  },
});

interface IActionsProps<FilterData = IAnything> {
  className?: string;
  style?: React.CSSProperties;
  filterData: FilterData;
  actions: IListAction[];
}

const createAction = ({ 
  type, 
  options = [],
  action,
}: IListAction) => {
  if (type === ActionType.Add) {
    return (
      <ActionAdd
        action={action}
      />
    );
  } else if (type === ActionType.Menu) {
    return (
      <ActionMenu
        options={options}
      />
    )
  } else {
    throw new Error("List Actions unknown action type");
  }
};

export const Actions = <FilterData extends IAnything>({
  className,
  actions,
  style,
}: IActionsProps<FilterData>) => {
  const classes = useStyles();
  return (
    <div
      className={classNames(className, classes.root, {
        [classes.noData]: actions.length === 0,
      })}
      style={style}
    >
      <div className={classes.stretch} />
      {actions.map((action, idx) => (
        <Fragment key={idx}>
          {createAction(action)}
        </Fragment>
      ))}
    </div>
  );
};

export default Actions;
