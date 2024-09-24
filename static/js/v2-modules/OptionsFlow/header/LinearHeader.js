import React from 'react';
import Grid2 from '@mui/material/Unstable_Grid2';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { convertNumberToDollar } from '../logic';

export default function LinearHeader(props) {
    return (
        <>
            <Grid2 xs={12} md={6}>
                <Card
                    sx={{
                        minWidth: 275,
                        backgroundColor: 'transparent',
                        backgroundImage:
                            'radial-gradient(circle,rgba(255, 255, 255, .05), rgba(0, 0, 0, .00))',
                    }}
                >
                    <CardContent sx={{ paddingTop: 0, paddingBottom: '8px !important' }}>
                        <Typography
                            sx={{
                                fontSize: 14,
                                fontWeight: 'bold',
                                marginTop: '5px',
                                marginBottom: '0px',
                                paddingBottom: '0px',
                            }}
                            color="#fff"
                            gutterBottom
                        >
                            CALLS:
                        </Typography>
                        <Typography
                            sx={{
                                color: '#fff',
                                marginTop: '0px',
                                paddingTop: '0px',
                                fontSize: '30px',
                                fontWeight: '600',
                            }}
                        >
                            {props.optionsSentiment.calls}%
                        </Typography>
                        <Typography sx={{ fontSize: 12 }} color="#fff" gutterBottom>
                            Volume: {props.optionsSentiment.callVolume} - Value:{' '}
                            {convertNumberToDollar(props.optionsSentiment.callPrice)}
                        </Typography>
                        <LinearProgress
                            color="success"
                            variant="determinate"
                            value={props.optionsSentiment.calls}
                            sx={{
                                height: '10px',
                                borderRadius: '5px',
                                '& .MuiLinearProgress-bar': {
                                    background:
                                        'linear-gradient(90deg, rgba(74,207,129,0.05) 0%, rgba(74,207,129,1) 100%)',
                                },
                            }}
                        />
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2 xs={12} md={6}>
                <Card
                    sx={{
                        minWidth: 275,
                        backgroundColor: 'transparent',
                        backgroundImage:
                            'radial-gradient(circle,rgba(255, 255, 255, .05), rgba(0, 0, 0, .00))',
                    }}
                >
                    <CardContent sx={{ paddingTop: 0, paddingBottom: '8px !important' }}>
                        <Typography
                            sx={{
                                fontSize: 14,
                                fontWeight: 'bold',
                                marginTop: '5px',
                                marginBottom: '0px',
                                paddingBottom: '0px',
                            }}
                            color="#fff"
                            gutterBottom
                        >
                            PUTS:
                        </Typography>
                        <Typography
                            variant="h5"
                            color="#fff"
                            sx={{
                                color: '#fff',
                                marginTop: '0px',
                                paddingTop: '0px',
                                fontSize: '30px',
                                fontWeight: '600',
                            }}
                        >
                            {props.optionsSentiment.puts}%
                        </Typography>
                        <Typography sx={{ fontSize: 12 }} color="#fff" gutterBottom>
                            Volume: {props.optionsSentiment.putVolume} - Value:{' '}
                            {convertNumberToDollar(props.optionsSentiment.putPrice)}
                        </Typography>
                        <LinearProgress
                            color="error"
                            variant="determinate"
                            value={props.optionsSentiment.puts}
                            sx={{
                                height: '10px',
                                borderRadius: '5px',
                                '& .MuiLinearProgress-bar': {
                                    background:
                                        'linear-gradient(90deg, rgba(230,50,98,0.05) 0%, rgba(230,50,98,1) 100%) ',
                                },
                            }}
                        />
                    </CardContent>
                </Card>
            </Grid2>
        </>
    );
}
