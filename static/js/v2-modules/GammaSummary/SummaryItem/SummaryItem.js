import React from 'react';
import Grid2 from '@mui/material/Unstable_Grid2';
import { Typography } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import AdjustIcon from '@mui/icons-material/Adjust';
import ArrowDropUpRoundedIcon from '@mui/icons-material/ArrowDropUpRounded';

export default function SummaryItem(props) {
    return (
        <Grid2 key={'volume-header'} xs={12} md={12} sx={{marginTop: '5px'}}>
            <Card
                sx={{
                    backgroundColor: 'transparent',
                    backgroundImage:
                        'radial-gradient(circle,rgba(255, 255, 255, .05), rgba(0, 0, 0, .00))',
                }}
            >
                <CardContent
                    sx={{
                        padding: '10px !important',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: 12,
                            fontWeight: 'bold',
                            marginTop: '5px',
                            marginBottom: '0px',
                            paddingBottom: '0px',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                        color="#fff"
                        gutterBottom
                    >
                        <AdjustIcon fontSize={'small'} sx={{ marginRight: '5px', opacity: 0.5, color:'#e5038c' }} />
                        {props.title}
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: 20,
                            padding: '0 !important',
                            margin: '0 !important',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                        color="#fff"
                        gutterBottom
                    >
                        {props.data || 'loading...'}
                        <ArrowDropUpRoundedIcon
                            style={{ color: '#4acf81' }}
                            fontSize={'medium'}
                            sx={{ marginLeft: '5px', opacity: 0 }}
                        />
                    </Typography>
                </CardContent>
            </Card>
        </Grid2>
    );
}
