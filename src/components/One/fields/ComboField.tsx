import * as React from "react";

import Combo from "../../../components/One/slots/ComboSlot";

import makeField from "../components/makeField";

import IManaged, { PickProp } from "../../../model/IManaged";
import IAnything from "../../../model/IAnything";
import IField from "../../../model/IField";

export interface IComboFieldProps<Data = IAnything> {
  description?: PickProp<IField<Data>, "description">;
  placeholder?: PickProp<IField<Data>, "placeholder">;
  outlined?: PickProp<IField<Data>, "outlined">;
  itemList?: PickProp<IField<Data>, "itemList">;
  keepSync?: PickProp<IField<Data>, "keepSync">;
  readonly?: PickProp<IField<Data>, "readonly">;
  disabled?: PickProp<IField<Data>, "disabled">;
  title?: PickProp<IField<Data>, "title">;
  tr?: PickProp<IField<Data>, "tr">;
  groupRef?: PickProp<IField<Data>, 'groupRef'>;
}

export interface IComboFieldPrivate<Data = IAnything>  {
  value: PickProp<IManaged<Data>, "value">;
  fieldReadonly: PickProp<IManaged<Data>, "fieldReadonly">;
  onChange: PickProp<IManaged<Data>, "onChange">;
  dirty: PickProp<IManaged<Data>, "dirty">;
  invalid: PickProp<IManaged<Data>, "invalid">;
}

export const ComboField = ({
  value,
  disabled,
  readonly,
  fieldReadonly,
  description = "",
  placeholder = "",
  outlined = true,
  itemList = [],
  keepSync = true,
  title = "",
  dirty,
  invalid,
  tr = (s) => s.toString(),
  onChange,
}: IComboFieldProps & IComboFieldPrivate) => (
  <Combo
    value={value}
    disabled={disabled}
    readonly={readonly}
    fieldReadonly={fieldReadonly}
    description={description}
    placeholder={placeholder}
    outlined={outlined}
    itemList={itemList}
    keepSync={keepSync}
    title={title}
    dirty={dirty}
    invalid={invalid}
    tr={tr}
    onChange={onChange}
  />
);

ComboField.displayName = "ComboField";

export default makeField(ComboField, {
  skipDebounce: true,
});
