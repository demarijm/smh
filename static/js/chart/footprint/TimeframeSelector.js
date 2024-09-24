import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { MenuItem, Select } from '@mui/material';
import React, { useCallback, useContext } from 'react';
import { DashboardItemContext } from '../../context/DashboardItemContext';

export const TimeframeSelector = () => {
    const dashboardItemContext = useContext(DashboardItemContext);
    const [dashboardItemState, dashboardItemDispatch] = Array.isArray(dashboardItemContext)
        ? dashboardItemContext
        : [];

    const timeframe = dashboardItemState?.timeframe || 5;

    const updateTimeframe = useCallback(
        (value) => dashboardItemDispatch({ type: 'setTimeframe', timeframe: value }),
        [dashboardItemDispatch],
    );

    return (
        <Select
            key="timeframe-select"
            value={timeframe}
            onChange={(event) => updateTimeframe(event?.target?.value)}
            IconComponent={ArrowDropDownIcon}
            sx={{
                alignSelf: 'center',
                maxHeight: '31px',
                width: '100%',
                '& .MuiSelect-select': {
                    color: '#fff',
                },
                '& .MuiSvgIcon-root': {
                    color: '#fff',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                    background: 'rgba(255,255,255,0.05)',
                    borderColor: '#FFFFFF',
                },
            }}
        >
            <MenuItem key={1} value={1}>
                1 minute
            </MenuItem>
            <MenuItem key={5} value={5}>
                5 minutes
            </MenuItem>
            <MenuItem key={15} value={15}>
                15 minutes
            </MenuItem>
            <MenuItem key={30} value={30}>
                30 minutes
            </MenuItem>
            <MenuItem key={60} value={60}>
                1 hour
            </MenuItem>
            {/* <MenuItem key={1440} value={1440}>
                1 day
            </MenuItem> */}
        </Select>
    );
};
