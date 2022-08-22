import * as React from 'react';

import CheckBox from '../../../components/One/slots/CheckBoxSlot';

import makeField from "../components/makeField";

import IManaged, { PickProp } from '../../../model/IManaged';
import IAnything from '../../../model/IAnything';
import IField from '../../../model/IField';

export interface ICheckboxFieldProps<Data = IAnything> {
  title?: PickProp<IField<Data>, 'title'>;
  readonly?: PickProp<IField<Data>, "readonly">;
  disabled?: PickProp<IField<Data>, "disabled">;
  groupRef?: PickProp<IField<Data>, 'groupRef'>;
}

export interface ICheckboxFieldPrivate<Data = IAnything>  {
  value: PickProp<IManaged<Data>, 'value'>;
  onChange: PickProp<IManaged<Data>, 'onChange'>;
}

export const CheckboxField = ({
  disabled,
  value,
  onChange,
  title
}: ICheckboxFieldProps & ICheckboxFieldPrivate) => (
  <CheckBox
    disabled={disabled}
    value={value}
    onChange={onChange}
    title={title}
  />
);

CheckboxField.displayName = 'CheckboxField';

export default makeField(CheckboxField, {
  skipDebounce: true,
});
