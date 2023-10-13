import * as React from 'react';

import { makeStyles } from "../../../styles";

import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

const useStyles = makeStyles()({
  dialog: {
    '&:first-of-type': {
      padding: 0,
    },
    overflow: 'hidden',
  },
});

interface IModalDialogProps extends DialogProps {
  children: React.ReactNode;
  disabled?: boolean;
  invalid?: boolean;
  canCancel?: boolean;
  noSave?: boolean;
  dividers?: boolean;
  onAccept?: () => void;
  onDismiss?: () => void;
}

export const ModalDialog = ({
  children,
  disabled,
  invalid,
  dividers = false,
  canCancel = true,
  noSave = false,
  onAccept = () => console.log('accept'),
  onDismiss = () => console.log('dismiss'),
  ...other
}: IModalDialogProps) => {
  const { classes } = useStyles();
  return (
    <Dialog {...other}>
      <DialogContent dividers={dividers} className={classes.dialog}>
        { children }
      </DialogContent>
      <DialogActions>
        {!noSave && (
          <Button
            disabled={disabled || invalid}
            color="primary"
            onClick={onAccept}
          >
            OK
          </Button>
        )}
        {canCancel && (
          <Button
            disabled={disabled}
            color="primary"
            onClick={onDismiss}
          >
            Cancel
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ModalDialog;
