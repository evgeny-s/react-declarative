import * as React from "react";
import { useState } from "react";
import { SxProps } from "@mui/material";

import InputBase from "@mui/material/InputBase";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";

import useStateContext from "../context/StateContext";

import CloseIcon from "@mui/icons-material/Close";

interface ISearchProps {
  className?: string;
  style?: React.CSSProperties;
  sx?: SxProps;
}

export const Search = ({
  className,
  style,
  sx,
}: ISearchProps) => {
  const { searchText, setSearchText } = useStateContext();
  const [readonly, setReadonly] = useState(true);
  return (
    <InputBase
      className={className}
      style={style}
      sx={{
        height: '100%',
        ...sx
      }}
      readOnly={readonly}
      fullWidth
      onChange={({ target }) => setSearchText(target.value.toString())}
      value={searchText}
      placeholder="Search"
      autoComplete="off"
      endAdornment={!!searchText ? (
        <InputAdornment position="end">
          <div style={{ marginRight: -10 }}>
            <IconButton onClick={() => setSearchText("")}>
              <CloseIcon />
            </IconButton>
          </div>
        </InputAdornment>
      ) : undefined}
      name="search"
      type="text"
      onFocus={() => setReadonly(false)}
      onTouchStart={() => setReadonly(false)}
    />
  );
};

export default Search;
