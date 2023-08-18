import FieldType from '../../../model/FieldType';
import IField from '../../../model/IField';

const layouts: FieldType[] = [
    FieldType.Group,
    FieldType.Box,
    FieldType.Paper,
    FieldType.Outline,
    FieldType.Expansion,
    FieldType.Div,
    FieldType.Tabs,
    FieldType.Hero,
    FieldType.Fragment,
    FieldType.Center,
    FieldType.Stretch,
    FieldType.Condition,
    FieldType.Layout,
];

/**
 * Компоновки работают как stateless, нам не нужно дожидаться
 * инициализации состояния
 */
export const isStatefull = ({type, name}: IField) => name && !layouts.includes(type);

export default isStatefull;
