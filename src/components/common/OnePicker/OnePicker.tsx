import * as React from 'react';
import { useState } from 'react';

import ModalDialog from '../ModalDialog';
import One from '../../One';

import Box from '@mui/material/Box';
import DialogTitle from '@mui/material/DialogTitle';

import useActualValue from "../../../hooks/useActualValue";
import useRenderWaiter from "../../../hooks/useRenderWaiter";

import IField from '../../../model/IField';
import IAnything from '../../../model/IAnything';
import IOneProps, { OneHandler } from '../../../model/IOneProps';

import sleep from '../../../utils/sleep';

interface IOnePickerProps<Data = IAnything, Payload = IAnything> {
  waitForChangesDelay?: number;
  onChange: (data: Data | null) => void;
  handler?: OneHandler<Data, Payload>;
  payload?: IOneProps<Data, Payload>['payload'];
  title?: string;
  fields: IField[];
  open?: boolean;
}

const WAIT_FOR_CHANGES_DELAY = 1_000;

export const OnePicker = <Data extends IAnything = IAnything, Payload = IAnything>({
  waitForChangesDelay = WAIT_FOR_CHANGES_DELAY,
  onChange = (data: Data | null) => console.log({ data }),
  fields,
  handler,
  payload,
  title,
  open = true,
}: IOnePickerProps<Data, Payload>) => {
  const [data, setData] = useState<Data | null>(null);
  const [disabled, setDisabled] = useState(false);

  const data$ = useActualValue(data);

  const waitForRender = useRenderWaiter([data], 10);

  const waitForChanges = async () => {
    await Promise.race([
      waitForRender(),
      sleep(waitForChangesDelay),
    ]);
  };

  const handleChange = (data: Data) => setData(data);
  const handleDismiss = () => onChange(null);

  const handleAccept = async () => {
    setDisabled(true);
    try {
      await waitForChanges();
      onChange(data$.current);
    } finally {
      setDisabled(false);
    }
  };

  return (
    <ModalDialog
      open={open}
      disabled={disabled}
      onAccept={handleAccept}
      onDismiss={handleDismiss}
    >
      {!!title && (
        <DialogTitle>
          <Box mr={3}>
            {title}
          </Box>
        </DialogTitle>
      )}
      <Box p={3}>
        <One
          change={handleChange}
          handler={handler}
          payload={payload}
          fields={fields}
        />
      </Box>
    </ModalDialog>
  );
};

export default OnePicker;
