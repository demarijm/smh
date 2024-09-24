import React, { useRef } from 'react';
import { Box, Divider, Paper } from '@mui/material';

export const DashboardItemContainer = ({ toolbar, body }) => {
    const containerRef = useRef();

    return (
        <Paper
            ref={containerRef}
            sx={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(139,134,128,0.05)',
                color: '#fff',
                overflow: 'hidden',
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                {React.cloneElement(toolbar, { containerRef })}
            </Box>
            <Divider
                variant={'middle'}
                sx={{
                    color: 'rgba(0,0,0,0)',
                    borderColor: 'rgba(0,0,0,0.2)',
                }}
            />
            <div
                style={{
                    flexGrow: 1,
                    flexShrink: 2,
                    maxWidth: '100%',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    position: 'relative',
                }}
            >
                {React.cloneElement(body, { containerRef })}
            </div>
        </Paper>
    );
};
