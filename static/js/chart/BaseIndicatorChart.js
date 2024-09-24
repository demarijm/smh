import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import moment from 'moment';
import { Chart } from 'react-chartjs-2';
import { extractDataset, getDataSets, getOptions } from './chartConfig';
import Grid2 from '@mui/material/Unstable_Grid2';
import { tickerMetadata } from '../util/utils';
import { DashboardItemContext } from '../context/DashboardItemContext';
import { StatusOverlay } from '../infrastructure/StatusOverlay';
import { VariantSelector } from '../infrastructure/VariantSelector';
import { exposureSocketService, SOCKET_TYPE } from '../infrastructure/SocketService';
import { DateRangeSelector } from '../infrastructure/DateRangeSelector';
import { ShowDistributions } from '../infrastructure/ShowDistributions';

export const BaseIndicatorChart = ({
    indicatorLabel,
    callsId,
    putsId,
    netId,
    getChartRange,
    showIV,
    variants,
}) => {
    const dashboardItemContext = useContext(DashboardItemContext);
    const [dashboardItemState, dashboardItemDispatch] = Array.isArray(dashboardItemContext)
        ? dashboardItemContext
        : [];

    const ticker = dashboardItemState?.ticker || 'SPX';
    const displayMode = dashboardItemState?.displayMode || 'net';
    const selectedDateRange = dashboardItemState?.selectedDateRange;
    const selectedVariant = dashboardItemState?.variant;
    const showDistributions = dashboardItemState?.showDistributions;

    const [loading, setLoading] = useState(false);
    const [exposureData, setExposureData] = useState({});
    const [error, setError] = useState(undefined);
    const [dataUpdatedAt, setDataUpdatedAt] = useState(Date.now());

    const [userOverride, setUserOverride] = useState(false);
    const [chartFocused, setChartFocused] = useState(false);
    const chartRef = useRef(undefined);

    const setSelectedVariant = useCallback(
        (variant) =>
            dashboardItemDispatch({
                type: 'setVariant',
                variant: variant,
            }),
        [dashboardItemDispatch],
    );

    const setShowDistributions = useCallback(
        (showDistributions) =>
            dashboardItemDispatch({
                type: 'setShowDistributions',
                showDistributions: showDistributions,
            }),
        [dashboardItemDispatch],
    );

    useEffect(() => {
        setLoading(true);
        setExposureData({});

        const socketCallback = (data) => {
            setLoading(false);
            setExposureData(data || {});
            setDataUpdatedAt(Date.now());
        };
        const startDateStr = selectedDateRange?.[0]?.format('YYYY-MM-DD') || undefined;
        const endDateStr = selectedDateRange?.[1]?.format('YYYY-MM-DD') || undefined;

        const socket = exposureSocketService.subscribe(
            SOCKET_TYPE.EXPOSURE,
            ticker,
            { current: socketCallback },
            () => {},
            setError,
            { startDate: startDateStr, endDate: endDateStr },
        );
        return () => {
            setExposureData({});
            exposureSocketService.unsubscribe(SOCKET_TYPE.EXPOSURE, ticker, socket, {
                startDate: startDateStr,
                endDate: endDateStr,
            });
        };
    }, [selectedDateRange, ticker]);

    const { spotPrice, expirationDate: serverSelectedDate } = exposureData || {
        data: {},
        spotPrice: 0,
    };
    const optionsData = useMemo(
        () => (exposureData.data ? JSON.parse(exposureData.data) : {}),
        [exposureData.data],
    );

    const tickerLabel = tickerMetadata[ticker]?.label || ticker;

    const spotLabel = `${tickerLabel} Spot: ${
        spotPrice ? Math.round((spotPrice + Number.EPSILON) * 100) / 100 : 0
    }`;
    const handleLegendClick = (e, legendItem, legend) => {
        // Default behavior except prevent hiding the spot price
        const index = legendItem.datasetIndex;
        const ci = legend.chart;
        if (ci.isDatasetVisible(index) && legendItem.text !== spotLabel) {
            ci.hide(index);
            legendItem.hidden = true;
        } else {
            ci.show(index);
            legendItem.hidden = false;
        }
    };

    if (selectedVariant) {
        callsId = 'Call' + selectedVariant;
        putsId = 'Put' + selectedVariant;
        netId = 'Total' + selectedVariant;
    }

    const strikes = Object.keys(optionsData || {}).map((strike) => parseFloat(strike));
    const chartData = {
        labels: strikes,
        datasets: getDataSets(
            optionsData,
            displayMode,
            spotLabel,
            indicatorLabel,
            callsId,
            putsId,
            netId,
            showIV,
            showDistributions,
        ),
    };

    const lastUpdatedLabel = dataUpdatedAt
        ? 'Last updated at ' + moment.unix(dataUpdatedAt / 1000.0).format('h:mm:ss a')
        : '';

    const [defXMin, defXMax] = useMemo(() => {
        return getChartRange(optionsData, spotPrice, callsId, putsId, strikes, ticker);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [optionsData]);

    // Don't reset the scales on data refresh if user has panned or zoomed
    const xMin = userOverride ? chartRef.current.options.scales.x.min : defXMin;
    const xMax = userOverride ? chartRef.current.options.scales.x.max : defXMax;

    useEffect(() => {
        let serverSelectedDateStr;
        if (serverSelectedDate) {
            serverSelectedDateStr = moment.unix(serverSelectedDate).format('YYYY-MM-DD');
            serverSelectedDateStr = `${serverSelectedDateStr} - ${serverSelectedDateStr}`;
        } else {
            serverSelectedDateStr = 'Expiration';
        }

        const actions = [
            {
                component: DateRangeSelector,
                props: {
                    key: 'date-select',
                    slotProps: {
                        textField: {
                            placeholder: serverSelectedDateStr,
                        },
                    },
                },
            },
        ];
        if (variants?.length > 0) {
            actions.push(
                {
                    component: VariantSelector,
                    props: {
                        key: 'variant-select',
                        selectedVariant: selectedVariant,
                        setSelectedVariant: setSelectedVariant,
                        variantOptions: variants,
                    },
                },
                {
                    component: ShowDistributions,
                    props: {
                        key: 'show-distributions',
                        showDistributions: showDistributions,
                        setShowDistributions: setShowDistributions,
                    },
                },
            );
        }

        dashboardItemDispatch({
            type: 'setCustomActions',
            customActions: actions,
        });
    }, [
        dashboardItemDispatch,
        selectedVariant,
        setSelectedVariant,
        serverSelectedDate,
        variants,
        variants?.length,
        showDistributions,
        setShowDistributions,
    ]);

    useEffect(() => {
        setUserOverride(false);
    }, [ticker]);

    const onResizeComplete = () => {
        setUserOverride(true);
    };

    const title = useCallback(() => {
        const totalIndicatorCol = extractDataset(optionsData, netId);
        const totalIndicator =
            Math.round(
                (totalIndicatorCol.reduce((partialSum, a) => partialSum + a, 0) + Number.EPSILON) *
                    100,
            ) / 100;
        return `Total: $${optionsData ? totalIndicator : '...'} Bn per 1% Move ${
            selectedVariant ? '(' + variants.find((v) => v.id === selectedVariant).label + ')' : ''
        }`;
    }, [netId, optionsData, selectedVariant, variants]);

    const options = getOptions(
        chartRef,
        spotPrice,
        xMin,
        xMax,
        handleLegendClick,
        `${indicatorLabel} Exposure`,
        lastUpdatedLabel,
        onResizeComplete,
        title,
        chartFocused,
        () => setChartFocused((old) => !old),
    );
    // The watermark value is loaded asynchronously so we need to update the runtime chart instance directly
    if (chartRef.current) {
        chartRef.current.watermark = options.watermark || {};
    }

    return (
        <div style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%' }}>
            <Grid2 container spacing={2} maxWidth={'100%'} paddingTop={'8px'} height={'100%'}>
                <Grid2
                    xs={12}
                    position={'relative'}
                    sx={{ maxHeight: '100%', paddingBottom: '0px', paddingRight: '0px' }}
                >
                    <StatusOverlay loading={loading} error={error} />
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <Chart type={'bar'} ref={chartRef} options={options} data={chartData} />
                    </div>
                </Grid2>
            </Grid2>
        </div>
    );
};
