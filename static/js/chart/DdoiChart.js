import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from 'react-query';
import { Chart } from 'react-chartjs-2';
import { fetchDdoi, getGammaSummary } from '../api/apexApi';
import { getOptions } from './chartConfig';
import Grid2 from '@mui/material/Unstable_Grid2';
import { tickerMetadata } from '../util/utils';
import { DashboardItemContext } from '../context/DashboardItemContext';
import { StatusOverlay } from '../infrastructure/StatusOverlay';
import dayjs from 'dayjs';
import { DateSelector } from '../infrastructure/DateSelector';

export const DdoiChart = ({ getChartRange }) => {
    const dashboardItemContext = useContext(DashboardItemContext);
    const [dashboardItemState, dashboardItemDispatch] = Array.isArray(dashboardItemContext)
    ? dashboardItemContext
    : [];    
    const selectedDateStr = (dashboardItemState?.selectedDate || dayjs.tz()).format('YYYY/MM/DD');

    const ticker = dashboardItemState?.ticker || 'SPX';
    const [userOverride, setUserOverride] = useState(false);
    const [chartFocused, setChartFocused] = useState(false);
    const chartRef = useRef(undefined);
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
        ['ddoi-data', selectedDateStr],
        () =>
            fetchDdoi(selectedDateStr).then((result) => {
                var parsedDDOI = result.data
                
                if (result.responseStatus === 'SUCCESS') {
                    return {
                        ddoiData: parsedDDOI,
                        date: result.date,
                    };
                } else {
                    if (result.errorCode === 'NOT_FOUND') {
                        throw new Error('No data available, please try again later.');
                    } else {
                        console.log('error in DDOI')
                        throw new Error('Server error, please try again later.');
                    }
                }
            }),
        {
            cacheTime: 1000 * 60 * 60 * 24, // 24 hours
            staleTime: 1000 * 60 * 60 * 24, // 24 hours
            refetchInterval: 1000 * 60 * 60 * 24, // 24 hours
            keepPreviousData: true,
            retry: false,
        },
    );
    const { ddoiData, date: ddoiUpdatedDate } = queryData || { ddoiData: {}, date: undefined };
    const ddoiDataByTicker = useMemo(() => {
        const result = {};
        
        // Reformat to be {ticker1: {strike1: {C: ddoi1, P: ddoi2}}, {strike2: {...}}, ...}
        Object.values(ddoiData).forEach((row) => {
            let ticker = row['ticker'];
            if (ticker === '^SPX') {
                ticker = 'SPX';
            }

            const cType = row['cType'];
            const strike = row['strike'];
            const ddoi = row['ddoi'];

            result[ticker] = {
                ...(result[ticker] || {}),
                [strike]: {
                    ...(result?.[ticker]?.[strike] || {}),
                    [cType]: ddoi,
                },
            };
        });
        return result;
    }, [ddoiData]);

    const { data } = useQuery(
        [ticker, 'ddoi'],
        () =>
            getGammaSummary(tickerMetadata[ticker]?.value || ticker).then((result) => {
                if (result.spotPrice) {
                    return {
                        spotPrice: result.spotPrice || 0,
                    };
                } else {
                    if (result.errorCode === 'NO_GAMMA') {
                        throw new Error('No data available, please try again later.');
                    } else if (result.errorCode === 'INVALID_TICKER') {
                        throw new Error('Invalid ticker.');
                    } else {
                        throw new Error('Server error, please try again later.');
                    }
                }
            }),
        {
            cacheTime: 1000 * 60, // 1 minute
            staleTime: 1000 * 60, // 1 minute
            refetchInterval: 1000 * 60, // 1 minute
            keepPreviousData: true,
            retry: false,
        },
    );
    const { spotPrice } = data || { spotPrice: 0 };
    const spotLabel = `${ticker} Spot: ${
        spotPrice ? Math.round((spotPrice + Number.EPSILON) * 100) / 100 : 0
    }`;

    const strikes = Object.keys(ddoiDataByTicker[ticker] || {}).map((strike) => parseFloat(strike));
    const chartData = {
        labels: strikes,
        datasets: [
            {
                id: 'calls',
                type: 'bar',
                label: 'Call DDOI',
                data: Object.values(ddoiDataByTicker[ticker] || {}).map((cpDdoi) => cpDdoi['C']),
                backgroundColor: '#4acf81',
                stack: '1',
                yAxisID: 'y',
                order: 3,
            },
            {
                id: 'puts',
                type: 'bar',
                label: 'Put DDOI',
                data: Object.values(ddoiDataByTicker[ticker] || {}).map((cpDdoi) => cpDdoi['P']),
                backgroundColor: '#e63262',
                stack: '2',
                yAxisID: 'y',
                order: 3,
            },
            {
                id: 'spot',
                type: 'bar',
                label: spotLabel,
                barThickness: 0,
                skipNull: true,
                backgroundColor: 'rgba(238,234,234,0.62)',
                borderColor: 'rgba(238,234,234,0.62)',
                stack: '1',
                yAxisID: 'y',
            },
        ],
    };

    const [defXMin, defXMax] = useMemo(() => {
        let weightedDdoiSum = 0;
        let weightsSum = 0;
        Object.entries(ddoiDataByTicker[ticker] || {}).forEach(([strike, cpDdoi]) => {
            weightedDdoiSum += Number(strike) * (cpDdoi['C'] || 0);
            weightedDdoiSum += Number(strike) * (cpDdoi['P'] || 0);
            weightsSum += cpDdoi['C'] || 0;
            weightsSum += cpDdoi['P'] || 0;
        });
        const weightedMean = weightedDdoiSum / (weightsSum || 1);
        return getChartRange(
            ddoiDataByTicker[ticker] || {},
            weightedMean,
            'C',
            'P',
            strikes,
            ticker,
        );

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ddoiData, ticker]);

    // Don't reset the scales on data refresh if user has panned or zoomed
    const xMin = userOverride ? chartRef.current.options.scales.x.min : defXMin;
    const xMax = userOverride ? chartRef.current.options.scales.x.max : defXMax;

    useEffect(() => {
        setUserOverride(false);
    }, [ticker]);

    const onResizeComplete = () => {
        setUserOverride(true);
    };

    const lastUpdatedLabel = ddoiUpdatedDate
        ? 'Last updated at ' + new Date(ddoiUpdatedDate).toISOString()
        : '';

    const supportedTickers = Object.keys(ddoiDataByTicker || {});
    supportedTickers.sort();
    const unsupportedTickerError = supportedTickers?.length > 0 &&
        !supportedTickers.includes(ticker) && {
            message: 'Supported tickers: ' + supportedTickers.reverse().join(', '),
        };

    const options = getOptions(
        chartRef,
        spotPrice,
        xMin,
        xMax,
        undefined,
        'DDOI',
        lastUpdatedLabel,
        onResizeComplete,
        undefined,
        chartFocused,
        () => setChartFocused((old) => !old),
    );
    // The watermark value is loaded asynchronously so we need to update the runtime chart instance directly
    if (chartRef.current) {
        chartRef.current.watermark = options.watermark || {};
    }

    return (
        <>
            <Grid2 container spacing={2} maxWidth={'100%'} paddingTop={'8px'} height={'100%'}>
                <Grid2 xs={12} position={'relative'} sx={{ maxHeight: '100%' }}>
                    <StatusOverlay loading={loading} error={unsupportedTickerError || error} />
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <Chart type={'bar'} ref={chartRef} options={options} data={chartData} />
                    </div>
                </Grid2>
            </Grid2>
        </>
    );
};
