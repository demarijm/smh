import React from 'react';
import { Slide } from '@mui/material';
import { GridRow } from '@mui/x-data-grid-pro';

export const AnimatedGridRow = (props) => {
    return (
        <Slide direction={'left'} in={true}>
            <div>
                <GridRow {...props} />
            </div>
        </Slide>
    );
};
