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
    virtualListBox,
    dirty,
    invalid,
    title,
    tr = (s) => s.toString(),
    shouldUpdateItemList: shouldUpdate = () => false,
    onChange,
}: IItemsSlot) => {

    const { object } = useOneState();
    const payload = useOnePayload();

    const [state, setState] = useState<IState>(() => ({
        options: [],
        labels: {},
    }));

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

    const {
        fallback,
    } = useOneProps();

    const {
        loading,
        execute,
    } = useAsyncAction(async (object) => {
        const labels: Record<string, string> = {};
        itemList = arrays(itemList) || [];
        const options = Object.values(typeof itemList === 'function' ? await Promise.resolve(itemList(object, payload)) : itemList);
        await Promise.all(options.map(async (item) => labels[item] = await Promise.resolve(tr(item, object, payload))));
        if (freeSolo) {
            value.forEach((item) => {
                if (!options.includes(item)) {
                    options.push(item);
                }
            });
        }
        setState({ options, labels });
    }, {
        fallback,
    });

    const valueHash = getArrayHash(value);
    const prevObject = useRef<any>(null);
    const isShouldUpdate = shouldUpdate(prevObject.current, object, payload);

    useEffect(() => {
        prevObject.current = object;
        execute(object);
    }, [
        valueHash,
        isShouldUpdate,
        disabled,
        dirty,
        invalid,
        object,
        readonly,
    ]);

    const createRenderTags = (labels: Record<string, any>) => (value: any[], getTagProps: AutocompleteRenderGetTagProps) => {
        return value.map((option: string, index: number) => (
            <Chip
                variant={outlined ? "outlined" : "filled"}
                label={freeSolo ? option : (labels[option] || `${option} (unknown)`)}
                {...getTagProps({ index })}
            />
        ))
    };

    const createGetOptionLabel = (labels: Record<string, any>) => (v: string) => {
        if (freeSolo) {
            return v;
        }
        return labels[v] || `${v} (unknown)`;
    };

    const createRenderInput = (loading: boolean, readonly: boolean) => (params: AutocompleteRenderInputParams) => (
        <MatTextField
            variant={outlined ? "outlined" : "standard"}
            {...params}
            label={title}
            placeholder={placeholder}
            helperText={(dirty && invalid) || description}
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
        />
    );

    const createRenderOption = (labels: Record<string, any>) => (props: React.HTMLAttributes<HTMLLIElement>, option: any, state: AutocompleteRenderOptionState) => (
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

    const handleChange = (value: any) => {
        onChange(value?.length ? objects(value) : null);
    };

    const { options, labels } = state;

    if (loading && !options.length) {
        return (
            <Autocomplete
                multiple
                disableCloseOnSelect
                loading
                disabled
                freeSolo={freeSolo}
                onChange={() => null}
                value={EMPTY_ARRAY}
                options={EMPTY_ARRAY}
                ListboxComponent={virtualListBox ? VirtualListBox : undefined}
                getOptionLabel={createGetOptionLabel({})}
                renderTags={createRenderTags({})}
                renderInput={createRenderInput(true, true)}
                renderOption={createRenderOption({})}
            />
        );
    }

    return (
        <Autocomplete
            multiple
            loading={loading}
            disableCloseOnSelect
            freeSolo={freeSolo}
            readOnly={readonly}
            onChange={({ }, value) => handleChange(value)}
            getOptionLabel={createGetOptionLabel(labels)}
            ListboxComponent={virtualListBox ? VirtualListBox : undefined}
            value={value}
            options={options}
            renderTags={createRenderTags(labels)}
            renderInput={createRenderInput(false, !!readonly)}
            renderOption={createRenderOption(labels)}
        />
    );
};

export default Items;
