import * as React from "react";
import { useContext, useMemo } from "react";
import { createContext } from "react";

import IField from "../../../model/IField";
import IAnything from "../../../model/IAnything";
import IOneProps from "../../../model/IOneProps";

const PropsContext = createContext<IOneProps<any, any>>(null as never);

interface IPropsProviderProps<
  Data extends IAnything = IAnything,
  Field extends IField<Data> = IField<Data>
> extends IOneProps<Data, Field> {
  children: React.ReactNode;
}

export const PropsProvider = <
  Data extends IAnything = IAnything,
  Field extends IField<Data> = IField<Data>
>({
  children,
  ...otherProps
}: IPropsProviderProps<Data, Field>) => {
  const props = useMemo(() => otherProps, Object.values(otherProps));
  return (
    <PropsContext.Provider value={props}>{children}</PropsContext.Provider>
  );
};

export const useOneProps = <Data extends IAnything = IAnything>() =>
  useContext(PropsContext) as IOneProps<Data>;

export default PropsProvider;
