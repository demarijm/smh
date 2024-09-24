import React from 'react';
import { Typography } from '@mui/material';

export default function ContractStat(props){

    return(
        <Typography
            sx={{
                fontSize: '12px',
                textTransform: 'uppercase',
                fontWeight: '600 !important',
                padding: '10px 20px !important',
                border: '1px solid rgba(230,2,136, 1)',
                backgroundColor: 'rgba(230,2,136, 0.1)',
                borderRadius: '25px',
                marginRight: '10px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                    backgroundColor: 'rgba(230,2,136, 0.5)',
                }
            }}
        >
           <span style={{fontWeight:'bold'}}>{props.stat}</span>: {props.value}
        </Typography>
    )
};