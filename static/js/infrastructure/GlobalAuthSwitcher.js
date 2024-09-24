import { useGlobalAuth } from '../useGlobalAuth';
import { Box, Button, Typography } from '@mui/material';
import { invalidateSessions } from '../api/apexApi';
import React from 'react';

export const GlobalAuthSwitcher = ({ children }) => {
    const [{ isDuplicateSession }] = useGlobalAuth();

    if (isDuplicateSession) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'absolute',
                    alignItems: 'center',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    justifyContent: 'center',
                }}
            >
                <Typography variant={'h3'} sx={{ textAlign: 'center' }}>
                    Traderlink is open on another device.
                    <br />
                    Click "Use Here" to use on this device.
                </Typography>
                <Button
                    id={'duplicateSession'}
                    variant={'contained'}
                    onClick={invalidateSessions}
                    sx={{ marginTop: '10px', backgroundColor: '#4acf81' }}
                >
                    Use Here
                </Button>
            </Box>
        );
    }

    // Prevents re-rendering all the children on every API call unless the global auth state has changed
    return children;
};
