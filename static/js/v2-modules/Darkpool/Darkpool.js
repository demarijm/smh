import React, { useContext, useEffect } from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { DashboardItemContext } from '../../context/DashboardItemContext';
import { DateSelector } from '../../infrastructure/DateSelector';
import { useQuery } from 'react-query';
import dayjs from 'dayjs';
import Grid2 from '@mui/material/Unstable_Grid2';
import { datagridStyles } from '../DatagridStyles/datagridStyles';
import { StatusOverlay } from '../../infrastructure/StatusOverlay';
import { AnimatedGridRow } from '../../infrastructure/AnimatedGridRow';
import { getTopTenDarkpool, INVALID_TICKER_MSG } from '../../api/apexApi';
import { convertUnixTimestamp } from '../OptionsFlow/logic';

const tradeColumns = [
    {
        field: 'timestamp',
        headerName: 'Timestamp',
        sortable: true,
        filterable: false,
        flex: 1,
        renderCell: (params) => convertUnixTimestamp(params.value),
    },
    { field: 'price', headerName: 'Price', sortable: true, filterable: false, flex: 1 },
    { field: 'size', headerName: 'Size', sortable: true, filterable: false, flex: 1 },
    { field: 'convertedValue', headerName: 'Value', sortable: true, filterable: false, flex: 1 },
];

export default function Top10Darkpool() {
    const dashboardItemContext = useContext(DashboardItemContext);
    const [dashboardItemState, dashboardItemDispatch] = Array.isArray(dashboardItemContext)
        ? dashboardItemContext
        : [];
    const ticker = dashboardItemState?.ticker || 'SPY';
    const selectedDateStr = (dashboardItemState?.selectedDate || dayjs.tz()).format('YYYY/MM/DD');

    useEffect(() => {
        dashboardItemDispatch({
            type: 'setCustomActions',
            customActions: [
                {
                    component: DateSelector,
                    props: {
                        key: 'date-select',
                    },
                },
            ],
        });
    }, [dashboardItemDispatch]);

    const {
        isFetching: loading,
        error,
        data: queryData,
    } = useQuery(
        [ticker, selectedDateStr, 'top10-darkpool'],
        () =>
            getTopTenDarkpool(ticker, selectedDateStr).then((result) => {
                if (result === INVALID_TICKER_MSG) {
                    throw new Error('Invalid ticker.');
                }

                if (result.top10Darkpool) {
                    return {
                        darkpoolData: result.top10Darkpool,
                    };
                } else {
                    throw new Error('Server error, please try again later.');
                }
            }),
        {
            cacheTime: 1000 * 60, // 1 minute
            staleTime: 1000 * 60, // 1 minute
            refetchInterval: 1000 * 30, // 30 seconds
            keepPreviousData: true,
            retry: false,
        },
    );
    const { darkpoolData } = queryData || { darkpoolData: [] };

    return (
        <>
            <StatusOverlay loading={loading || !darkpoolData} error={error} />
            <Grid2
                xs={12}
                md={12}
                sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.0)',
                    width: '100%',
                    '& .buy': {
                        color: '#4acf81 !important',
                    },
                    '& .sell': {
                        color: '#e63262 !important',
                    },
                    margin: '0px 10px 10px 10px',
                    position: 'relative',
                }}
            >
                <DataGridPro
                    getRowId={(r) => r._id}
                    sx={datagridStyles}
                    rows={darkpoolData}
                    columns={tradeColumns}
                    throttleRowsMs={0}
                    getCellClassName={(params) => {
                        if (params.field !== 'sentiment') {
                            return '';
                        }
                        if(params.value === 'aboveAsk' ||params.value === 'atAsk'){
                            return 'buy'
                        }
                        if(params.value === 'underBid' ||params.value === 'atBid'){
                            return 'sell'
                        }
                    }}
                    hideFooter
                    disableSelectionOnClick
                    hideFooterPagination
                    hideFooterSelectedRowCount
                    slots={{ row: AnimatedGridRow }}
                />
            </Grid2>
        </>
    );
}
