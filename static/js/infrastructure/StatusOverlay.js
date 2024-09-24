import { Box, CircularProgress, Typography } from '@mui/material';
import React from 'react';

export const StatusOverlay = ({ loading, error }) => {
    if (!loading && !error) {
        return null;
    }

    const body = error ? (
            <Typography variant={'h4'}>
                {error?.message || 'server error, please try again later.'}
            </Typography>
    ) : (
        <div style={{display:'flex', flexDirection: 'column', padding: 0, margin: 0, alignItems: 'center'
        }} >
            <CircularProgress  sx={{color:"#E6038C"}} />
            <Typography variant={'h4'}>
                loading...
            </Typography>
        </div>
    );

    return (
        <Box
            sx={{
                display: 'flex',
                position: 'absolute',
                width: '100%',
                height: '100%',
                alignItems:'center', 
                justifyContent: "center",
                zIndex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
            }}
        >
            {body}
        </Box>
    );
};
