import Calendar from '@mui/icons-material/Event';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { SingleInputDateRangeField } from '@mui/x-date-pickers-pro/SingleInputDateRangeField';
import { useCallback, useContext, useEffect, useState } from 'react';
import { DashboardItemContext } from '../context/DashboardItemContext';
import { SharedDashboardContext } from '../context/SharedDashboardContext';
import dayjs from 'dayjs';

// i.e. 'MM/DD/YYYY - MM/DD/YYYY'
const SEPARATOR_CHARS = ['/', '–', ' '];

const advanceInputFocus = (element, startIndex, endIndex) => {
    if (element.setSelectionRange) {
        element.focus();
        element.setSelectionRange(startIndex, endIndex);
    }
};

export const DateRangeSelector = (props) => {
    const [sharedState] = useContext(SharedDashboardContext);
    const [state, dispatch] = useContext(DashboardItemContext);
    const value = state.selectedDateRange;

    const [open, setOpen] = useState(false);
    const [localValue, setLocalValue] = useState(value);
    const persistChange = useCallback(() => {
        if (!localValue || (localValue[0] && localValue[1]) || (!localValue[0] && !localValue[1])) {
            dispatch({ type: 'setSelectedDateRange', selectedDateRange: localValue });
        }
    }, [dispatch, localValue]);

    const onKeyDown = useCallback(
        (event) => {
            if (event.key === 'Enter') {
                persistChange();
            }

            // setSelectionRange not supported on all browsers
            if (event.key === 'Tab' && event.target.setSelectionRange) {
                const cursorPosition = event.target.selectionEnd;
                let matches = SEPARATOR_CHARS.map((char) =>
                    event.target.value.indexOf(char, cursorPosition),
                ).filter((index) => index > 0);

                const nextBlock =
                    matches.length > 0
                        ? matches.reduce(
                              (acc, index) => Math.min(acc, index),
                              Number.MAX_SAFE_INTEGER,
                          )
                        : -1;
                if (nextBlock > 0) {
                    matches = SEPARATOR_CHARS.map((char) =>
                        event.target.value.indexOf(char, nextBlock + 1),
                    ).filter((index) => index > 0);

                    let nextBlockEnd =
                        matches.length > 0
                            ? matches.reduce(
                                  (acc, index) => Math.min(acc, index),
                                  Number.MAX_SAFE_INTEGER,
                              )
                            : -1;
                    if (nextBlockEnd < 0) {
                        nextBlockEnd = event.target.value.length;
                    }

                    advanceInputFocus(event.target, nextBlock + 1, nextBlockEnd);

                    event.preventDefault();
                }
            }
        },
        [persistChange],
    );

    useEffect(() => {
        if (!open) {
            // Done in a useEffect to make sure this happens after localValue has been updated
            persistChange();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useEffect(() => {
        // The date was updated externally, sync the local value
        if (sharedState.updatedViaLink) {
            setLocalValue(value);
        }
    }, [sharedState.updatedViaLink, value]);

    const todayLabel = dayjs.tz().format('MM/DD/YYYY');
    const maxDate = localValue?.[0] ? localValue[0].add(31, 'day') : undefined;
    return (
        <DateRangePicker
            {...props}
            value={localValue || [null, null]} // Using null array so that the component is still considered 'controlled'
            sx={{
                color: '#fff',
                maxHeight: '31px',
                alignSelf: 'center',

                '> div': {
                    maxHeight: '100%',
                },
                '& input': {
                    color: '#fff',
                },
                '& .MuiInputBase-input': {
                    color: '#fff',
                    height: '1.4375em',
                    padding: '4px 0px 4px 9px',
                },
                '& .MuiSvgIcon-root': {
                    color: '#fff',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                    background: 'rgba(255,255,255,0.05)',
                    borderColor: '#FFFFFF',
                },
            }}
            onChange={setLocalValue}
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            calendars={1}
            disablePast={true}
            maxDate={maxDate}
            slots={{ field: SingleInputDateRangeField }}
            slotProps={{
                ...props.slotProps,
                textField: {
                    placeholder: `${todayLabel} - ${todayLabel}`,
                    size: 'small',
                    InputProps: { endAdornment: <Calendar /> },

                    ...props.slotProps?.textField,
                    onBlur: persistChange,
                    onKeyDown: onKeyDown,
                    fullWidth: true,
                },
            }}
        />
    );
};
