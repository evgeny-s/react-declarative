import * as React from 'react';

import { makeStyles } from "../../styles";

import MatBreadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';

import ActionMenu from '../ActionMenu';

import IBreadcrumbsOption from '../../model/IBreadcrumbsOption';

const BREADCRUMBS_SAVE_DELAY = 500;

const useStyles = makeStyles()((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    justifyContent: "end",
    flexDirection: "row",
    paddingTop: "10px",
    paddingBottom: "10px",
    flexWrap: 'wrap',
    gap: theme.spacing(1),
  },
  stretch: {
    flexGrow: 1,
    shrink: 1,
  },
  button: {
    borderRadius: '50px !important',
    minHeight: '40px !important',
    paddingLeft: '15px !important',
    paddingRight: '15px !important',
  },
}));

interface IBreadcrumbsProps<T extends any = any> {
  onSave?: () => void;
  onBack?: () => void;
  onAction?: (action: string) => void;
  actions?: IBreadcrumbsOption<T>[];
  saveDisabled?: boolean;
  title?: string;
  subtitle?: string;
  withSave?: boolean;
  payload?: T;
  BeforeMenuContent?: React.ComponentType<any>;
  AfterMenuContent?: React.ComponentType<any>;
}

export const Breadcrumbs = <T extends any = any>({
  onSave,
  onBack,
  onAction,
  actions,
  saveDisabled,
  payload,
  title = 'Title',
  subtitle = 'Subtitle',
  withSave = false,
  BeforeMenuContent,
  AfterMenuContent,
}: IBreadcrumbsProps<T>) => {
  const { classes } = useStyles();

  const handleSave = () => onSave && setTimeout(onSave, BREADCRUMBS_SAVE_DELAY);

  return (
    <Box className={classes.root}>
      <MatBreadcrumbs className={classes.stretch} aria-label="breadcrumb">
        <Link sx={{ cursor: 'pointer' }} onClick={onBack} color="inherit">{title}</Link>
        <Typography sx={{ cursor: 'pointer' }} color="textPrimary">{subtitle}</Typography>
      </MatBreadcrumbs>
      {!!withSave && (
        <Button
          className={classes.button}
          variant="contained"
          size="small"
          onClick={handleSave}
          color="primary"
          disabled={saveDisabled}
        >
          Save
        </Button>
      )}
      {!!actions?.length && (
        <ActionMenu
          payload={payload}
          options={actions.map(({
            isVisible = () => true,
            isDisabled = () => false,
            ...other
          }) => ({
            ...other,
            isVisible: () => isVisible(payload!),
            isDisabled: () => isDisabled(payload!),
          }))}
          onAction={onAction}
          BeforeContent={BeforeMenuContent}
          AfterContent={AfterMenuContent}
        />
      )}
    </Box>
  );
};

export default Breadcrumbs;
