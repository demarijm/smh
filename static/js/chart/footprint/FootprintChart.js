import { StatusOverlay } from '../../infrastructure/StatusOverlay';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { DashboardItemContext } from '../../context/DashboardItemContext';
import Grid2 from '@mui/material/Unstable_Grid2';
import { Chart } from 'react-chartjs-2';
import {
    filterOutliers,
    getChartData,
    getOptions,
    MINUTES_TO_MILLIS,
} from './footprintChartConfig';
import { useBatchedFlowSocket } from './useBatchedFlowSocket';
import { TimeframeSelector } from './TimeframeSelector';
import { VariantSelector } from '../../infrastructure/VariantSelector';

// The minimum number of pixels per time slice before labels start clipping horizontally
const MIN_PIXELS_PER_SLICE = 100;

const variants = [
    { id: 'BidAsk', label: 'Bid / Ask' },
    { id: 'Delta', label: 'Delta' },
];

export const FootprintChart = ({ containerRef }) => {
    const [error, setError] = useState(undefined);
    const [chartDataByTimestamp, setChartDataByTimestamp] = useState({});
    const fullRefreshTimeRef = useRef(Date.now());

    const chartRef = useRef(undefined);
    const dashboardItemContext = useContext(DashboardItemContext);
    const [dashboardItemState, dashboardItemDispatch] = Array.isArray(dashboardItemContext)
        ? dashboardItemContext
        : [];

    const ticker = dashboardItemState?.ticker || 'SPY';
    const timeframe = dashboardItemState?.timeframe || 5;
    const selectedVariant = dashboardItemState?.variant || 'BidAsk';

    const setSelectedVariant = useCallback(
        (variant) => {
            dashboardItemDispatch({
                type: 'setVariant',
                variant: variant,
            });
        },
        [dashboardItemDispatch],
    );

    const { unsubscribe, socketLoading, socketError } = useBatchedFlowSocket({
        ticker,
        timeframe,
        handleMessages: (messages, timeframe) => handleSocketMessage(messages, timeframe),
    });

    const handleSocketMessage = useCallback(
        (messages, timeframe) => {
            setChartDataByTimestamp((existingData) => {
                let newState = { ...existingData };

                const canvas = containerRef.current.getElementsByTagName('canvas')[0];
                const bodyHeight = canvas.clientHeight;
                const bodyWidth = canvas.clientWidth;

                messages.every(({ msg: data, type }) => {
                    if (data === 'INVALID_TICKER') {
                        setError({ message: 'Invalid ticker.' });
                        unsubscribe();
                        return false; // stop iteration
                    }

                    const recalculateFull = (data) => {
                        // Calculate cents per pixel, which will be used to dynamically group the data based on the module size
                        const filteredData = filterOutliers(data);

                        const allPrices = filteredData.map((row) => [row.high, row.low]).flat();
                        const minPrice = allPrices.reduce(
                            (acc, row) => Math.min(acc, row),
                            Number.MAX_VALUE,
                        );
                        const maxPrice = allPrices.reduce((acc, row) => Math.max(acc, row), 0);
                        const centsPerPixel = (maxPrice - minPrice) / bodyHeight;

                        newState = filteredData.reduce(
                            (acc, row) => ({
                                ...acc,
                                [row.startingTimestamp]: getChartData([row], centsPerPixel),
                            }),
                            {},
                        );
                        fullRefreshTimeRef.current = Date.now();
                    };

                    const recalculatePartial = (sliceTimestamp) => {
                        // Calculate cents per pixel, which will be used to dynamically group the data based on the module size
                        const existingPrices = Object.entries(newState)
                            .filter(([key, _]) => key !== sliceTimestamp)
                            .map(([_, value]) =>
                                value.boxes
                                    .filter((el) => el.type === 'line')
                                    .map((line) => [line.yMin, line.yMax])
                                    .flat(),
                            )
                            .flat();

                        const filteredData = filterOutliers([data])[0];

                        const allPrices = [filteredData.high, filteredData.low, ...existingPrices];
                        const minPrice = allPrices.reduce(
                            (acc, row) => Math.min(acc, row),
                            Number.MAX_VALUE,
                        );
                        const maxPrice = allPrices.reduce((acc, row) => Math.max(acc, row), 0);
                        const centsPerPixel = (maxPrice - minPrice) / bodyHeight;

                        newState[sliceTimestamp] = getChartData([filteredData], centsPerPixel);
                    };

                    setError(undefined);
                    if (type === 'init') {
                        recalculateFull(data);
                    } else {
                        const lastFullRefreshTime = fullRefreshTimeRef.current;
                        const sliceTimestamp = data.startingTimestamp;
                        if (!newState[sliceTimestamp] || Date.now() - lastFullRefreshTime > 60000) {
                            // A new timestamp is being added or the last full refresh was over 1 minute ago. Recalculate the full dataset to mitigate previous bars being compressed / expanded as the price moves
                            recalculateFull([
                                ...Object.values(newState)
                                    .map((timestamp) => timestamp.rawData)
                                    .flat(),
                                data,
                            ]);
                        } else {
                            // Replace any data with the same starting timestamp
                            recalculatePartial(sliceTimestamp);
                        }
                    }

                    // Then remove bars older than 8 (or however many fit the screen) time intervals
                    const numberOfIntervals = Math.min(
                        8,
                        Math.floor(bodyWidth / MIN_PIXELS_PER_SLICE),
                    );

                    const newestTimestamp = Math.max(...Object.keys(newState));
                    const cutOff =
                        newestTimestamp - (numberOfIntervals - 1) * timeframe * MINUTES_TO_MILLIS;
                    newState = Object.keys(newState)
                        .filter((timestamp) => timestamp >= cutOff)
                        .reduce((acc, key) => ({ ...acc, [key]: newState[key] }), {});

                    return true;
                });

                return newState;
            });
        },
        [containerRef, unsubscribe],
    );

    useEffect(() => {
        setChartDataByTimestamp({});
    }, [ticker, timeframe]);

    useEffect(() => {
        dashboardItemDispatch({
            type: 'setCustomActions',
            customActions: [
                {
                    component: TimeframeSelector,
                },
                {
                    component: VariantSelector,
                    props: {
                        key: 'variant-select',
                        selectedVariant: selectedVariant,
                        setSelectedVariant: setSelectedVariant,
                        variantOptions: variants,
                        includeNullValue: false,
                    },
                },
            ],
        });
    }, [dashboardItemDispatch, selectedVariant, setSelectedVariant]);

    const [datasets, boxes] = useMemo(
        () =>
            Object.values(chartDataByTimestamp).reduce(
                (acc, timeSlice) => {
                    const [dataSetsAcc, boxesAcc] = acc;
                    const variantDataSet = timeSlice.datasets.filter(
                        (set) => set.variant === selectedVariant,
                    );

                    return [
                        [...dataSetsAcc, ...variantDataSet],
                        [...boxesAcc, ...timeSlice.boxes],
                    ];
                },
                [[], []],
            ),
        [chartDataByTimestamp, selectedVariant],
    );

    const options = getOptions(boxes, timeframe);

    return (
        <div style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%' }}>
            <Grid2 container spacing={2} maxWidth={'100%'} paddingTop={'8px'} height={'100%'}>
                <Grid2
                    xs={12}
                    position={'relative'}
                    sx={{ maxHeight: '100%', paddingBottom: '0px', paddingRight: '0px' }}
                >
                    <StatusOverlay loading={socketLoading} error={socketError || error} />
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <Chart
                            ref={chartRef}
                            type={'bar'}
                            options={options}
                            data={{ datasets: datasets }}
                            datasetIdKey={'key'}
                        />
                    </div>
                </Grid2>
            </Grid2>
        </div>
    );
};
