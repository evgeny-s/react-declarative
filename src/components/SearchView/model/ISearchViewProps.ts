import { SxProps } from "@mui/material";
import ISearchItem from "./ISearchItem";

export interface ISearchViewProps {
  className?: string;
  style?: React.CSSProperties;
  sx?: SxProps;
  fullWidth?: boolean;
  value?: ISearchItem | (() => ISearchItem | Promise<ISearchItem>);
  type?:
    | "date"
    | "email"
    | "number"
    | "search"
    | "tel"
    | "text"
    | "time"
    | "url"
    | "week";
  handler: (
    search: string,
    limit: number,
    offset: number,
    initial: boolean,
    currentRows: ISearchItem[]
  ) => (ISearchItem[] | Promise<ISearchItem[]>);
  onChange?: (value: ISearchItem | null) => void;
  onTextChange?: (value: string) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  delay?: number;
  limit?: number;
  variant?: "standard" | "outlined" | "filled";
  onLoadStart?: () => void;
  onLoadEnd?: (isOk: boolean) => void;
  fallback?: (error: Error) => void;
  throwError?: boolean;
}

export default ISearchViewProps;
