import * as React from "react";
import { useMemo } from "react";

import { makeStyles } from "../../../styles";
import {
  Theme,
  alpha,
  createTheme,
  decomposeColor,
  recomposeColor,
  useTheme,
} from "@mui/material";

import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { ThemeProvider } from "@mui/material";
import FadeView from "../../FadeView";

import useChips from "../hooks/useChips";
import useProps from "../hooks/useProps";

import { IListChip } from "../../../model/IListProps";

import { IChipListSlot } from "../slots/ChipListSlot";

const useStyles = makeStyles()((theme) => ({
  root: {
    height: 48,
    width: "100%",
    background: alpha(
      theme.palette.getContrastText(theme.palette.background.paper),
      0.05
    ),
  },
}));

export const ClassicChipListSlot = ({
  listChips = [],
  loading,
}: IChipListSlot) => {
  const theme = useTheme<Theme>();
  const { classes } = useStyles();

  const { withSingleChip } = useProps();

  const fadeColor = useMemo(() => {
    const a = 0.05;
    const oneminusalpha = 1 - a;
    const background = decomposeColor(theme.palette.background.paper);
    const overlay = decomposeColor(
      alpha(theme.palette.getContrastText(theme.palette.background.paper), a)
    );
    background.values[0] =
      overlay.values[0] * a + oneminusalpha * background.values[0];
    background.values[1] =
      overlay.values[1] * a + oneminusalpha * background.values[1];
    background.values[2] =
      overlay.values[2] * a + oneminusalpha * background.values[2];
    background.values[3] = 1.0;
    return recomposeColor(background);
  }, [theme]);

  const chipTheme = useMemo(() => {
    return listChips.reduce(
      (acm, { name, color = theme.palette.primary.main }) => ({
        [name]: createTheme({
          ...theme,
          palette: {
            ...theme.palette,
            primary: {
              main: color,
            },
          },
        }),
        ...acm,
      }),
      {}
    );
  }, [theme]);

  const { chips, setChips } = useChips();

  const createToggleHandler =
    (name: string, state = true) =>
    () => {
      if (withSingleChip) {
        [...chips.keys()].forEach((key) => chips.set(key, false));
      }
      chips.set(name, state);
      setChips(chips);
    };

  const renderChip = (chip: IListChip, idx: number) => {
    const name = chip.name.toString();
    const enabled = !!chips.get(name);
    return (
      <ThemeProvider key={`${enabled}-${idx}`} theme={chipTheme[name]}>
        <Chip
          variant={enabled ? "filled" : "outlined"}
          onClick={createToggleHandler(name, !enabled)}
          onDelete={enabled ? createToggleHandler(name, false) : undefined}
          color="primary"
          label={chip.label}
          disabled={loading}
        />
      </ThemeProvider>
    );
  };

  const enabledChips = listChips
    .filter(({ name }) => chips.get(name.toString()))
    .map(renderChip);

  const disabledChips = listChips
    .filter(({ name }) => !chips.get(name.toString()))
    .map(renderChip);

  return (
    <FadeView className={classes.root} color={fadeColor} disableBottom>
      <Stack
        alignItems="center"
        direction="row"
        marginLeft="5px"
        marginRight="5px"
        spacing={1}
      >
        {enabledChips}
        {disabledChips}
      </Stack>
    </FadeView>
  );
};

export default ClassicChipListSlot;
