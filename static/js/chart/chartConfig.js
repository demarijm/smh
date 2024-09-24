import { isNullOrUndef } from 'chart.js/helpers';

const SLOPE_GATE = 0.00001;

export const extractDataset = (optionsData, dataLabel) => {
    return Object.keys(optionsData || {}).map((key) => optionsData[key][dataLabel]);
};

const fitOuterCurve = (optionsData, dataLabel) => {
    // Split the data into positive and negative bands
    const result = [];
    let buffer = [];
    let positive = true;
    for (const [strike, option] of Object.entries(optionsData || {})) {
        const value = option[dataLabel];
        if (positive && value < 0 && buffer.length > 0) {
            result.push(...fitSignedCurve(buffer, true));
            buffer = [];
            positive = false;
        } else if (!positive && value > 0 && buffer.length > 0) {
            result.push(...fitSignedCurve(buffer, false));
            buffer = [];
            positive = true;
        }

        buffer.push([parseFloat(strike), value]);
    }

    if (buffer.length > 0) {
        result.push(...fitSignedCurve(buffer, positive));
    }

    return result;
};

const fitSignedCurve = (optionsData, isPositive) => {
    const [maxStrike, maxValue] = optionsData.reduce(
        (acc, [strike, option]) => {
            const value = option;
            if (isPositive ? value >= acc[1] : value <= acc[1]) {
                return [strike, value];
            }
            return acc;
        },
        [0, 0],
    );

    const newPoints = [];

    // For strikes below the max, add to the curve if the slope is positive
    let lastPoint = undefined;
    optionsData
        .filter(([strike]) => strike < maxStrike)
        .forEach(([strike, option]) => {
            if (!lastPoint) {
                // Always add the edge points
                lastPoint = { x: strike, y: option };
                newPoints.push(lastPoint);
                return;
            }

            const slope = (option - lastPoint.y) / (strike - lastPoint.x);
            if (Math.abs(slope) > SLOPE_GATE && (isPositive ? slope > 0 : slope < 0)) {
                lastPoint = { x: strike, y: option };
                newPoints.push(lastPoint);
            }
        });

    // Always add the max
    newPoints.push({ x: maxStrike, y: maxValue });

    // For strikes above the max, add to the curve if the slope is negative
    // Iteration is done in reverse to skip local minimums
    const newPointsAbove = [];
    lastPoint = undefined;
    optionsData
        .filter(([strike]) => strike > maxStrike)
        .reverse()
        .forEach(([strike, option]) => {
            if (!lastPoint) {
                // Always add the edge points
                lastPoint = { x: strike, y: option };
                newPointsAbove.push(lastPoint);
                return;
            }

            const slope = (option - lastPoint.y) / (strike - lastPoint.x);
            if (Math.abs(slope) > SLOPE_GATE && (isPositive ? slope < 0 : slope > 0)) {
                lastPoint = { x: strike, y: option };
                newPointsAbove.push(lastPoint);
            }
        });
    newPoints.push(...newPointsAbove.reverse());

    return newPoints;
};

export const getDataSets = (
    optionsData,
    displayMode,
    spotLabel,
    indicatorLabel,
    callsId,
    putsId,
    netId,
    showIV,
    showDistributions,
) => {
    const dataSet = [];

    if (displayMode === 'split') {
        dataSet.push(
            {
                id: 'calls',
                type: 'bar',
                label: `Positive ${indicatorLabel}`,
                data: extractDataset(optionsData, callsId),
                backgroundColor: '#4acf81',
                stack: '1',
                yAxisID: 'y',
                order: 3,
            },
            {
                id: 'puts',
                type: 'bar',
                label: `Negative ${indicatorLabel}`,
                data: extractDataset(optionsData, putsId),
                backgroundColor: '#e63262',
                stack: '1',
                yAxisID: 'y',
                order: 3,
            },
        );

        if (showDistributions) {
            const callsCurve = fitOuterCurve(optionsData, callsId);
            const putsCurve = fitOuterCurve(optionsData, putsId);

            dataSet.push(
                {
                    id: 'calls-trend',
                    type: 'line',
                    label: `_dist Positive ${indicatorLabel}`,
                    data: callsCurve,
                    backgroundColor: '#ffffff',
                    pointBackgroundColor: '#ffffff',
                    borderColor: '#ffffff',
                    tension: 0.2,
                    stack: '2',
                    yAxisID: 'y',
                    order: 2,
                    parsing: false,
                },
                {
                    id: 'puts-trend',
                    type: 'line',
                    label: `_dist Negative ${indicatorLabel}`,
                    data: putsCurve,
                    backgroundColor: '#ffffff',
                    pointBackgroundColor: '#ffffff',
                    borderColor: '#ffffff',
                    tension: 0.2,
                    stack: '2',
                    yAxisID: 'y',
                    order: 2,
                    parsing: false,
                },
            );
        }
    } else {
        dataSet.push({
            id: 'net',
            type: 'bar',
            label: `Net ${indicatorLabel}`,
            data: extractDataset(optionsData, netId),
            backgroundColor: '#56eef4',
            stack: '1',
            yAxisID: 'y',
            order: 3,
        });

        if (showDistributions) {
            const netCurve = fitOuterCurve(optionsData, netId);

            dataSet.push({
                id: 'net-trend',
                type: 'line',
                label: `Net ${indicatorLabel} Dist`,
                data: netCurve,
                backgroundColor: '#ffffff',
                pointBackgroundColor: '#ffffff',
                borderColor: '#ffffff',
                tension: 0.2,
                stack: '2',
                yAxisID: 'y',
                order: 2,
                parsing: false,
            });
        }
    }

    if (showIV) {
        dataSet.push({
            id: 'iv-avg',
            type: 'line',
            label: `Average IV`,
            order: true,
            data: extractDataset(optionsData, 'AvgIV'),
            backgroundColor: '#ffc933',
            borderColor: '#ffc933',
            borderWidth: 2,
            fill: false,
            stack: '1',
            yAxisID: 'iv',
            clip: 1,
            spanGaps: true,
            pointStyle: 'triangle',
            radius: 2,
            hitRadius: 5,
        });
    }

    dataSet.push({
        id: 'spot',
        type: 'bar',
        label: spotLabel,
        barThickness: 0,
        skipNull: true,
        backgroundColor: 'rgba(238,234,234,0.62)',
        borderColor: 'rgba(238,234,234,0.62)',
        stack: '1',
        yAxisID: 'y',
    });

    return dataSet;
};

export const getOptions = (
    chartRef,
    spotPrice,
    xMin,
    xMax,
    handleLegendClick,
    yAxisLabel,
    watermarkText,
    onResizeComplete = () => {},
    title,
    enableScroll,
    onClick,
) => {
    return {
        responsive: true,
        maintainAspectRatio: false,
        color: '#FFFFFF',
        onClick: onClick,
        plugins: {
            legend: {
                position: 'top',
                ...(handleLegendClick && { onClick: handleLegendClick }),
                labels: {
                    filter: (item) => {
                        return !item.text.startsWith('_dist');
                    },
                },
            },
            annotation: spotPrice
                ? {
                      clip: false,
                      annotations: [
                          {
                              type: 'line',
                              mode: 'vertical',
                              value:
                                  spotPrice && Math.round((spotPrice + Number.EPSILON) * 100) / 100,
                              scaleID: 'x',
                              borderColor: 'rgba(238,234,234,0.62)',
                          },
                      ],
                  }
                : {},
            ...(title && {
                title: {
                    display: true,
                    text: title,
                    align: 'start',
                    color: '#FFFFFF',
                    position: 'top',
                    padding: 0,
                    fullSize: false,
                },
            }),
            tooltip: {
                callbacks: {
                    label: function (tooltipItem, _) {
                        if (this && this.options && this.options.mode === 'dataset') {
                            return (
                                tooltipItem.label + ': ' + tooltipItem.formattedValue ||
                                tooltipItem.formattedValue
                            );
                        }

                        let label = tooltipItem.dataset.label || '';

                        if (label) {
                            label += ': ';
                        }
                        const value = tooltipItem.raw;
                        if (!isNullOrUndef(value)) {
                            label += value;
                        }
                        return label;
                    },
                },
            },
            datalabels: {
                display: false,
            },
            zoom: {
                zoom: {
                    wheel: {
                        enabled: enableScroll,
                    },
                    pinch: {
                        enabled: enableScroll,
                    },
                    mode: 'x',
                    onZoomComplete: onResizeComplete,
                },
                pan: {
                    enabled: true,
                    mode: 'x',
                    onPanComplete: onResizeComplete,
                },
            },
        },
        scales: {
            x: {
                stacked: 'single',
                type: 'linear',
                min: xMin || undefined,
                max: xMax || undefined,
                title: { text: 'Strike Price', display: true, color: '#FFFFFF' },
                offset: false,
                ticks: { color: '#FFFFFF' },
                grid: {
                    display: false,
                },
            },
            y: {
                title: { text: yAxisLabel, display: true, color: '#FFFFFF' },
                ticks: { color: '#FFFFFF' },
                grid: {
                    display: false,
                },
            },
            iv: {
                axis: 'y',
                display: 'auto',
                bounds: 'data',
                type: 'linear',
                title: { text: `Implied Volatility`, display: true, color: '#FFFFFF' },
                position: 'right',
                grid: { display: false },
                includeBounds: false,
                ticks: { color: '#FFFFFF' },
            },
        },
        ...(watermarkText && {
            watermark: {
                text: watermarkText,
                color: '#FFFFFF',
                x: 40,
                y: 15,
                width: 175,
                height: 50,
                opacity: 0.5,
                alignX: 'right',
                alignY: 'bottom',
                position: 'front',
            },
        }),
    };
};
