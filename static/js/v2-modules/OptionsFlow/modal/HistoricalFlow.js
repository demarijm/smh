import React from 'react';
import { DataGridPro, getGridNumericOperators } from '@mui/x-data-grid-pro';
import { convertUnixTimestamp, convertUnixTimestampWithDay } from '../logic';
import { Typography } from '@mui/material';
import { datagridStyles } from '../../DatagridStyles/datagridStyles';
import { AnimatedGridRow } from '../../../infrastructure/AnimatedGridRow';
import AdjustIcon from '@mui/icons-material/Adjust';
import Grid2 from '@mui/material/Unstable_Grid2';
import dayjs from 'dayjs';

const numberComparator = (a, b) =>
    Number(a.replace(/[^0-9.-]+/g, '')) - Number(b.replace(/[^0-9.-]+/g, ''));

const optionsColumns = [
    {
        field: 'nanoTimestamp',
        headerName: 'Time',
        sortable: true,
        filterable: true,
        renderCell: (params) => `${convertUnixTimestampWithDay(params.value)} ${convertUnixTimestamp(params.value)}`,
    },
    {
        field: 'contractTicker',
        headerName: 'Ticker',
        sortable: true,
        filterable: true,
        type: 'string',
    },
    {
        field: 'currentTickerMark',
        headerName: 'Mark',
        sortable: false,
        filterable: false,
        type: 'number',
    },
    {
        field: 'label',
        headerName: 'Block/Sweep',
        sortable: false,
        filterable: false,
        renderCell: (params) => {
            if(params.row.label === 'SWEEP'){
                return <p><a style={{color: 'rgb(142, 68, 173)'}}
                href={`https://datadev.traderlink.io/api/v2/options/getSweepOrders/${params.row._id}`}
                target="_blank"
                rel="noreferrer"
              >SWEEP</a></p>
            }else if(params.row.label === 'NONLABELEDSWEEP'){
                return <p><a style={{color: 'rgb(142, 68, 173)'}}
                href={`https://datadev.traderlink.io/api/v2/options/getSweepOrders/${params.row._id}/`}
                target="_blank"
                rel="noreferrer"
              >SPLIT</a></p>
            }else{
                return <p>BLOCK</p>
            }
        }
    },
    {
        field: 'contractStrike',
        headerName: 'Strike',
        sortable: true,
        filterable: true,
        type: 'string',
    },
    {
        field: 'contractType',
        headerName: 'C/P',
        sortable: false,
        filterable: true,
        renderCell: (params) => (
            <div className={params.value === 'CALL' ? 'bBG' : 'sBG'}>{params.value}</div>
        ),
    },

    {
        field: 'contractExipration',
        headerName: 'Expo',
        sortable: true,
        filterable: true,
        type: 'date',
        valueFormatter: ({ value }) => dayjs(value).format('MM/DD/YYYY'),
    },
    {
        field: 'contractDaysTillExpo',
        headerName: 'DTE',
        sortable: true,
        filterable: true,
        type: 'number',
        renderCell: (params) => `${params.value}d`,
    },

    {
        field: 'bidAsk',
        headerName: 'Bid/Ask',
        sortable: false,
        filterable: true,
        type: 'string',
        renderCell: (params) => `${params.row.contractBid} - ${params.row.contractAsk}`,
    },
    {
        field: 'contractPrice',
        headerName: 'Fill',
        sortable: false,
        filterable: true,
        type: 'number',
        sortComparator: numberComparator,
    },
  
    {
        field: 'tradeSize',
        headerName: 'Size',
        sortable: false,
        filterable: true,
        type: 'number',
        filterOperators: getGridNumericOperators().filter(
            (operator) => operator.value === '>' || operator.value === '<',
        ),
    },
    {
        field: 'totalTradeValue',
        headerName: 'Value',
        sortable: true,
        filterable: true,
        type: 'number',
        valueGetter: ({ value }) => Number(value.replace(/[^0-9.-]+/g, '')),
        renderCell: (params) => '$' + Math.round(params.value / 1000) + 'K',
        sortComparator: numberComparator,
    },
    {
        field: 'intent',
        headerName: 'Sentiment',
        sortable: true,
        filterable: true,
        renderCell: (params) => {
            if (params.value.includes('ask')) {
                return 'ASK';
            } else if (params.value.includes('bid')) {
                return 'BID';
            } else {
                return 'MARK';
            }
        },
    },
    {
        field: 'oi',
        headerName: 'OI',
        sortable: false,
        filterable: true,
        type: 'boolean',
            renderCell: (params) => {
                if(params.row.oi == null){
                    return `N/A`;
                }else{
                    return `${params.row.oi.toLocaleString()}`
                }
            },
        },
    {
        field: 'impliedVol',
        headerName: 'IV',
        sortable: false,
        filterable: true,
        type: 'boolean',
        renderCell: (params) => {
            if(params.row.impliedVol === null){
            return `N/A`;
            }else{
                return `${(params.row.impliedVol * 100).toFixed(2)}%`
            }
        },
    },
    {
        field: 'volGreaterThanOI',
        headerName: 'VOL>OI',
        sortable: false,
        filterable: true,
        type: 'boolean',
        renderCell: (params) => (
            <AdjustIcon fontSize={'small'} className={params.value === true ? 'blue' : 'null'} />
        ),
    },
    {
        field: 'contractOTM',
        headerName: 'OTM',
        sortable: false,
        filterable: true,
        type: 'boolean',
        renderCell: (params) => (
            <AdjustIcon fontSize={'small'} className={params.value === true ? 'purple' : 'null'} />
        ),
    },
    {
        field: 'isMultiLeg',
        headerName: 'Multileg',
        sortable: false,
        filterable: true,
        type: 'boolean',
        renderCell: (params) => (
            <AdjustIcon fontSize={'small'} className={params.value === true ? 'yellow' : 'null'} />
        ),
    },
    { field: 'highlight', headerName: 'highlight' },
];

export default function HistoricalFlow(props) {
    return (
        <Grid2
            xs={12}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                paddingBottom: '20px',
                boxSizing: 'border-box',
                '& .MuiDataGrid-virtualScroller': {
                    overflow: 'hidden',
                },
                '& .buy': {
                    color: '#4acf81 !important',
                },
                '& .sell': {
                    color: '#e63262 !important',
                },
                '& .bBG': {
                    background: '#4acf81',
                    padding: '5px',
                    borderRadius: '5px',
                    width: '50px',
                    textAlign: 'center',
                    color: '#fff',
                    boxSizing: 'border-box',
                },
                '& .sBG': {
                    background: '#e63262',
                    padding: '5px',
                    borderRadius: '5px',
                    width: '50px',
                    textAlign: 'center',
                    color: '#fff',
                    boxSizing: 'border-box',
                },
                '& .null': {
                    color: '#fff !important',
                    opacity: '0.1',
                },
                '& .highlight': {
                    backgroundImage:
                        'radial-gradient(circle, rgba(142, 68, 173, .4), rgba(0, 0, 0, .00)) !important',
                    borderTop: `1px solid rgba(142, 68, 173, .9)`,
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                },
                '& .basic': {
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                },
                '& .date': {
                    fontSize: '12px',
                    opacity: '0.6',
                },
                '& .value': {
                    fontSize: '16px',
                },
                '& .plain': {
                    textTransform: 'uppercase',
                    fontSize: '12px',
                },
                '& .blue': {
                    color: '#56EEF4 !important',
                },
                '& .purple': {
                    color: '#8e44ad !important',
                },
                '& .yellow': {
                    color: '#FFC933 !important',
                },
            }}
        >
            <Typography
                sx={{
                    typography: { sm: 'body4', xs: 'body4' },
                    fontWeight: '600 !important',
                    padding: '10px',
                    width: '100%',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    boxSizing: 'border-box',
                }}
            >
                {props.title}
            </Typography>
            <DataGridPro
                getRowId={(r) => r._id}
                sx={datagridStyles}
                rows={props.contractData}
                columns={optionsColumns}
                throttleRowsMs={0}
                getCellClassName={(params) => {
                    if (params.field === 'timestamp') {
                        return 'date';
                    } else if (params.field === ('totalTradeValue' || 'tradeSize')) {
                        return 'value';
                    } else if (params.value === ('above ask' || 'at ask')) {
                        return 'buy';
                    } else if (params.value === ('under bid' || 'at bid')) {
                        return 'sell';
                    } else if (params.value === ('over mark' || 'unknown')) {
                        return 'plain';
                    }
                }}
                getRowClassName={(params) => {
                    if (params.row.highlight === true || params.row.highlight === 'true') {
                        return 'highlight';
                    } else {
                        return 'basic';
                    }
                }}
                hideFooter
                disableSelectionOnClick
                hideFooterPagination
                hideFooterSelectedRowCount
                columnVisibilityModel={{
                    highlight: false,
                    contractDaysTillExpo: false,
                }}
                slots={{ row: AnimatedGridRow }}
                slotProps={{
                    panel: {
                        sx: {
                            '& .MuiDataGrid-filterFormValueInput': {
                                alignSelf: 'flex-end',
                            },
                        },
                    },
                }}
            />
        </Grid2>
    );
}
