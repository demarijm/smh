import React from 'react';
import { Typography } from '@mui/material';

export default function ModalTital(props){

    return(
        <Typography
            sx={{
                fontSize: '12px',
                textTransform: 'uppercase',
                fontWeight: '600 !important',
                padding: '10px 20px !important',
                border: '1px solid rgba(255,255,255, 1)',
                backgroundColor: 'rgba(255,255,255, 0.1)',
                borderRadius: '25px',
                marginRight: '10px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                    backgroundColor: 'rgba(255,255,255, 0.4)',
                }
            }}
        >
           {props.children}
        </Typography>
    )
};