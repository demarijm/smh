import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { Typography } from '@mui/material';
import React, { memo } from 'react';

const FailedToLoadPage = ({ message = 'Failed to load page. Please try again later' }) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                alignSelf: 'center',
            }}
        >
            <WarningAmberRoundedIcon
                color={'warning'}
                fontSize={'large'}
                sx={{ width: '5rem', height: '5rem' }}
            />
            <Typography variant={'h3'} sx={{ textAlign: 'center' }}>
                {message}
            </Typography>
        </div>
    );
};

export default memo(FailedToLoadPage);
