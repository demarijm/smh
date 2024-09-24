import React, { useContext, useEffect, useState } from 'react';
import { DashboardItemContext } from '../context/DashboardItemContext';
import { SharedDashboardContext } from '../context/SharedDashboardContext';
import { TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { DashboardItemToolbarSettings } from './DashboardItemToolbarSettings';

export const DashboardItemToolbar = ({ item, containerRef }) => {
    const [sharedState] = useContext(SharedDashboardContext);
    const [state, dispatch] = useContext(DashboardItemContext);
    const [localTicker, setLocalTicker] = useState(state?.ticker);

    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        // The ticker was updated externally, sync the local value
        if (sharedState.updatedViaLink) {
            setLocalTicker(state.ticker);
        }
    }, [sharedState.updatedViaLink, state.ticker]);

    const dispatchTicker = () => {
        dispatch({ type: 'setTicker', ticker: localTicker.toUpperCase() });
    };

    return (
        <div style={{width: '100%', display: 'flex', flexDirection: 'row', borderBottom: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)'}}>
            <Typography
                sx={{
                    typography: { sm: 'body1', xs: 'body2' },
                    textTransform: 'uppercase',
                    alignSelf: 'center',
                    marginLeft: '15px',
                    marginRight: '5px',
                    flexGrow: 1,
                    fontWeight: '600 !important',
                }}
            >
                {item.title} {!isXs && state.titleDecorator && '(' + state.titleDecorator + ')'}
            </Typography>
            <TextField
                size={'small'}
                placeholder={'Ticker'}
                onChange={(event) => setLocalTicker(event.target.value)}
                value={localTicker.toUpperCase()}
                variant={'outlined'}
                sx={{
                    alignSelf: 'center',
                    marginTop: '5px',
                    marginBottom: '5px',
                    maxWidth: '100px',
                    color: '#fff',
                    '& .MuiOutlinedInput-notchedOutline': {
                        background: 'rgba(255,255,255,0.05)',
                    },
                    '& input': {
                        color: '#fff',
                        padding: '20px',
                    },
                }}
                inputProps={{
                    onBlur: dispatchTicker,
                    onKeyDown: (event) => event.key === 'Enter' && dispatchTicker(),
                    sx: {
                        padding: '4px 14px !important',
                        border: 'unset !important',
                        color: '#fff',
                    },
                }}
            />
            <DashboardItemToolbarSettings item={item} containerRef={containerRef} />
        </div>
    );
};
