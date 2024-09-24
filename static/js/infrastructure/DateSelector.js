import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useCallback, useContext, useEffect, useState } from 'react';
import { DashboardItemContext } from '../context/DashboardItemContext';
import { SharedDashboardContext } from '../context/SharedDashboardContext';
import dayjs from 'dayjs';

// i.e. 'MM/DD/YYYY'
const SEPARATOR_CHAR = '/';

const advanceInputFocus = (element, startIndex, endIndex) => {
    if (element.setSelectionRange) {
        element.focus();
        element.setSelectionRange(startIndex, endIndex);
    }
};

export const DateSelector = (props) => {
    const [sharedState] = useContext(SharedDashboardContext);
    const [state, dispatch] = useContext(DashboardItemContext);
    const value = state.selectedDate;

    const [open, setOpen] = useState(false);
    const [localValue, setLocalValue] = useState(value);
    const persistChange = useCallback(
        () => dispatch({ type: 'setSelectedDate', selectedDate: localValue }),
        [dispatch, localValue],
    );

    const onKeyDown = useCallback(
        (event) => {
            if (event.key === 'Enter') {
                persistChange();
            }

            // setSelectionRange not supported on all browsers
            if (event.key === 'Tab' && event.target.setSelectionRange) {
                const cursorPosition = event.target.selectionEnd;
                const nextBlock = event.target.value.indexOf(SEPARATOR_CHAR, cursorPosition);
                if (nextBlock > 0) {
                    let nextBlockEnd = event.target.value.indexOf(SEPARATOR_CHAR, nextBlock + 1);
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

    return (
        <DatePicker
            {...props}
            value={localValue || null} // Using null so that the component is still considered 'controlled'
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
            slotProps={{
                ...props.slotProps,
                textField: {
                    placeholder: dayjs.tz().format('MM/DD/YYYY'),
                    size: 'small',

                    ...props.slotProps?.textField,
                    onBlur: persistChange,
                    onKeyDown: onKeyDown,
                    fullWidth: true,
                },
            }}
        />
    );
};
