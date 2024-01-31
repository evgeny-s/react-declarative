import * as React from "react";
import { useCallback } from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import MatSlider from "@mui/material/Slider";
import IconButton from "@mui/material/IconButton";

import useActualValue from "../../../../../hooks/useActualValue";

import { useOnePayload } from "../../../context/PayloadProvider";
import { useOneState } from "../../../context/StateProvider";

import deepClone from "../../../../../utils/deepClone";

import IAnything from "../../../../../model/IAnything";
import IManaged, { PickProp } from "../../../../../model/IManaged";

import { ISliderSlot } from "../../../slots/SliderSlot";

const createIcon = (
  icon: React.ComponentType<any>,
  data: IAnything,
  payload: IAnything,
  value: IAnything,
  onChange: (data: IAnything) => void,
  onValueChange: PickProp<IManaged, "onChange">,
  click: PickProp<IManaged, "leadingIconClick">,
  edge: "start" | "end"
) => (
  <IconButton
    onClick={() => {
      if (click) {
        click(
          value,
          data,
          payload,
          (v) =>
            onValueChange(v, {
              skipReadonly: true,
            }),
          onChange
        );
      }
    }}
    edge={edge}
  >
    {React.createElement(icon, { data, payload })}
  </IconButton>
);

export const Slider = ({
  value,
  onChange,
  leadingIcon: li,
  trailingIcon: ti,
  leadingIconClick: lic,
  trailingIconClick: tic,
  labelFormatSlider,
  stepSlider,
  maxSlider = 100,
  minSlider = 0,
}: ISliderSlot) => {
  const payload = useOnePayload();
  const { object, setObject } = useOneState<object>();

  const object$ = useActualValue(object);

  const handleChange = useCallback(
    (object: object) =>
      setObject(
        deepClone({
          ...object$.current,
          ...object,
        }),
        {}
      ),
    []
  );

  return (
    <Box mr={1}>
      <Grid alignItems="center" container spacing={2}>
        <Grid item>
          {li &&
            createIcon(
              li,
              object,
              payload,
              value as IAnything,
              handleChange,
              onChange,
              lic,
              "end"
            )}
        </Grid>
        <Grid item xs>
          <MatSlider
            step={stepSlider}
            marks={!!stepSlider}
            min={minSlider}
            max={maxSlider}
            aria-labelledby="discrete-slider"
            valueLabelDisplay="auto"
            color="primary"
            value={value || 0}
            onChange={({}, v) => onChange(v as number)}
            valueLabelFormat={labelFormatSlider}
          />
        </Grid>
        <Grid item>
          {ti &&
            createIcon(
              ti,
              object,
              payload,
              value as IAnything,
              handleChange,
              onChange,
              tic,
              "start"
            )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Slider;
