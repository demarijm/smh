import React from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { convertUnixTimestamp } from '../../OptionsFlow/logic';

export default function TableRow(props) {
    function setBackgroundColor(props) {
        if (props.rowData.size >= 10000) {
            return 'radial-gradient(circle, rgba(86, 238, 244, .9), rgba(0, 0, 0, .00))';
        } else if (props.rowData.sentiment === 'aboveAsk') {
            return 'radial-gradient(circle, rgba(74, 207, 129, .9), rgba(0, 0, 0, .00))';
        } else if (props.rowData.sentiment === 'underBid') {
            return 'radial-gradient(circle, rgba(230, 50, 98, .9), rgba(0, 0, 0, .00))';
        } else {
            return 'radial-gradient(circle,rgba(255, 255, 255, .05), rgba(0, 0, 0, .00))';
        }
    }
    function setBorderColor(props) {
        if (props.rowData.size >= 10000) {
            return 'rgba(86, 238, 244, .9)';
        } else if (props.rowData.sentiment === 'aboveAsk') {
            return 'rgba(74, 207, 129, .9)';
        } else if (props.rowData.sentiment === 'underBid') {
            return 'rgba(230, 50, 98, .9)';
        } else {
            return 'rgba(230, 50, 98, 0.0)';
        }
    }
    function setColor(props) {
        if (props.rowData.vwap === true) {
            return '#E6038C';
        } else if (props.rowData.sentiment === 'atAsk') {
            return '#4ACF81';
        } else if (props.rowData.sentiment === 'atBid') {
            return '#E63262';
        } else {
            return '#fff';
        }
    }

    return (
        <Grid
            container
            rowSpacing={1}
            columnSpacing={{ xs: 1 }}
            justifyContent="left"
            style={{
                backgroundImage: `${setBackgroundColor(props)}`,
                borderTop: `1px solid ${setBorderColor(props)}`,
                paddingBottom: '5px',
                marginBottom: '10px',
                fontFamily: 'Arial, Helvetica, sans-serif',
            }}
        >
            <Grid item xs={12} md={3}>
                <Typography
                    sx={{
                        fontSize: 12,
                        fontWeight: '600',
                        fontFamily: 'Arial, Helvetica, sans-serif',
                    }}
                    color={'#fff'}
                >
                    {convertUnixTimestamp(props.rowData.timestamp)}
                </Typography>
            </Grid>
            <Grid item xs={12} md={2}>
                <Typography
                    sx={{
                        fontSize: 12,
                        fontWeight: '600',
                        fontFamily: 'Arial, Helvetica, sans-serif',
                    }}
                    color={setColor(props)}
                >
                    {props.rowData.price}
                </Typography>
            </Grid>
            <Grid item xs={12} md={2}>
                <Typography
                    sx={{
                        fontSize: 12,
                        fontWeight: '600',
                        fontFamily: 'Arial, Helvetica, sans-serif',
                    }}
                    color={setColor(props)}
                >
                    {props.rowData.size}
                </Typography>
            </Grid>
            <Grid item xs={12} md={5}>
                <Typography
                    sx={{
                        fontSize: 12,
                        fontWeight: '600',
                        fontFamily: 'Arial, Helvetica, sans-serif',
                    }}
                    color={setColor(props)}
                >
                    {props.rowData.value}
                </Typography>
            </Grid>
        </Grid>
    );
}
