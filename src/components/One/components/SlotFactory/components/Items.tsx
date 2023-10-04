import * as React from 'react';
import { useMemo, useState, useRef, useEffect } from 'react';

import { AutocompleteRenderGetTagProps, AutocompleteRenderOptionState } from "@mui/material/Autocomplete";
import { AutocompleteRenderInputParams } from "@mui/material/Autocomplete";

import Autocomplete from "@mui/material/Autocomplete";

import CircularProgress from "@mui/material/CircularProgress";
import MatTextField from "@mui/material/TextField";
import Checkbox from '@mui/material/Checkbox';
import Chip from "@mui/material/Chip";

import VirtualListBox from '../../common/VirtualListBox';

import compareArray from '../../../../../utils/compareArray';
import isObject from '../../../../../utils/isObject';
import objects from '../../../../../utils/objects';
import arrays from '../../../../../utils/arrays';

import { useOneState } from '../../../context/StateProvider';
import { useOneProps } from '../../../context/PropsProvider';
import { useOnePayload } from '../../../context/PayloadProvider';
import { useAsyncAction } from '../../../../../hooks/useAsyncAction';
import { useActualValue } from '../../../../../hooks/useActualValue';
import { useRenderWaiter } from '../../../../../hooks/useRenderWaiter';

import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

import { IItemsSlot } from '../../../slots/ItemsSlot';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const EMPTY_ARRAY = [] as any;

const getArrayHash = (value: any) =>
    Object.values<string>(value || {})
        .sort((a, b) => b.localeCompare(a))
        .join('-');

interface IState {
    options: string[];
    labels: Record<string, string>;
}

export const Items = ({
    value: upperValue,
    disabled,
    readonly,
    description,
    placeholder,
    outlined = true,
    itemList = [],
    freeSolo,
    noDeselect,
    virtualListBox,
    watchItemList,
    labelShrink,
    dirty,
    invalid,
    title,
    tr = (s) => s.toString(),
    onChange,
}: IItemsSlot) => {

    const { object } = useOneState();
    const payload = useOnePayload();

    const [state, setState] = useState<IState>(() => ({
        options: [],
        labels: {},
    }));

    const initComplete = useRef(false);

    const waitForRender = useRenderWaiter([state], 10);

    const labels$ = useActualValue(state.labels);

    const arrayValue = useMemo(() => {
        if (typeof upperValue === 'string') {
            return [upperValue];
        }
        if (upperValue) {
            const result = Object.values<string>(upperValue);
            return isObject(result) ? [] : result;
        }
        return [];
    }, [upperValue]);

    const prevValue = useRef(arrayValue);

    const value = useMemo(() => {
        if (compareArray(prevValue.current, arrayValue)) {
            return prevValue.current;
        }
        prevValue.current = arrayValue;
        return arrayValue;
    }, [arrayValue]);

    const value$ = useActualValue(value);

    const {
        fallback,
    } = useOneProps();

    const {
        loading,
        execute,
    } = useAsyncAction(async (object) => {
        const labels: Record<string, string> = {};
        itemList = arrays(itemList) || [];
        const options: string[] = [...new Set(Object.values(typeof itemList === 'function' ? await Promise.resolve(itemList(object, payload)) : itemList))];
        await Promise.all(options.map(async (item) => labels[item] = await Promise.resolve(tr(item, object, payload))));
        if (freeSolo) {
            value.forEach((item) => {
                if (!options.includes(item)) {
                    options.push(item);
                }
            });
        }

        setState({ options, labels });
        initComplete.current = true;
        await waitForRender();
    }, {
        fallback,
    });

    const valueHash = getArrayHash(value);
    const prevObject = useRef<any>(null);
    const initial = useRef(true);

    useEffect(() => {
        if (!initial.current) {
            if (prevObject.current === object) {
                return;
            }
            if (!watchItemList) {
                return;
            }
        }
        prevObject.current = object;
        initial.current = false;
        execute(object);
    }, [
        valueHash,
        disabled,
        dirty,
        invalid,
        object,
        readonly,
    ]);

    const renderTags = (value: any[], getTagProps: AutocompleteRenderGetTagProps) => {
        const { current: labels } = labels$;
        return value.map((option: string, index: number) => (
            <Chip
                variant={outlined ? "outlined" : "filled"}
                label={freeSolo ? option : (labels[option] || `${option} (unknown)`)}
                {...getTagProps({ index })}
            />
        ))
    };

    const getOptionLabel = (v: string) => {
        const { current: labels } = labels$;
        if (freeSolo) {
            return v;
        }
        return labels[v] || `${v} (unknown)`;
    };

    const createRenderInput = (loading: boolean, readonly: boolean) => (params: AutocompleteRenderInputParams) => (
        <MatTextField
            {...params}
            sx={{
                ...(!outlined && {
                    position: 'relative',
                    mt: 1,
                    '& .MuiFormHelperText-root': {
                        position: 'absolute',
                        top: '100%',
                    },
                })
            }}
            variant={outlined ? "outlined" : "standard"}
            label={title}
            helperText={(dirty && invalid) || description}
            placeholder={loading ? undefined : value$.current.length ? undefined : placeholder}
            error={dirty && invalid !== null}
            InputProps={{
                ...params.InputProps,
                readOnly: readonly,
                endAdornment: (
                    <>
                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                    </>
                ),
            }}
            InputLabelProps={{
                ...params.InputLabelProps,
                ...(labelShrink && { shrink: true }),
            }}
        />
    );

    const renderOption = (props: React.HTMLAttributes<HTMLLIElement>, option: any, state: AutocompleteRenderOptionState) => {
        const { current: labels } = labels$;
        return (
            <li {...props}>
                <Checkbox
                    icon={icon}
                    checkedIcon={checkedIcon}
                    style={{ marginRight: 8 }}
                    checked={state.selected}
                />
                {freeSolo ? option : (labels[option] || `${option} (unknown)`)}
            </li>
        );
    };

    const handleChange = (value: any) => {
        onChange(value?.length ? objects(value) : null);
    };

    if (loading || !initComplete.current) {
        return (
            <Autocomplete
                multiple
                disableCloseOnSelect
                disableClearable={noDeselect}
                loading
                disabled
                freeSolo={freeSolo}
                onChange={() => null}
                value={EMPTY_ARRAY}
                options={EMPTY_ARRAY}
                ListboxComponent={virtualListBox ? VirtualListBox : undefined}
                getOptionLabel={getOptionLabel}
                renderTags={renderTags}
                renderInput={createRenderInput(true, true)}
                renderOption={renderOption}
            />
        );
    }

    return (
        <Autocomplete
            multiple
            loading={loading}
            disableCloseOnSelect
            disableClearable={noDeselect}
            freeSolo={freeSolo}
            readOnly={readonly}
            onChange={({ }, value) => handleChange(value)}
            getOptionLabel={getOptionLabel}
            ListboxComponent={virtualListBox ? VirtualListBox : undefined}
            value={value}
            options={state.options}
            renderTags={renderTags}
            renderInput={createRenderInput(false, !!readonly)}
            renderOption={renderOption}
        />
    );
};

export default Items;
