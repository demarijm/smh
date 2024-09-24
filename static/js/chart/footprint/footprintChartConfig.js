import dayjs from 'dayjs';
import * as components from 'chart.js';

export const MINUTES_TO_MILLIS = 60 * 1000;
const MIN_LABEL_DISTANCE_PX = 10;

components.Tooltip.positioners.bottom = function (items) {
    if (!items.length) {
        return false;
    }

    const chart = this.chart;
    const { top: chartTop } = chart.chartArea;
    const { x, y, height, base } = items[0].element;

    if (y - chartTop < 80) {
        return {
            x: x - (x - base) / 2,
            y: y + height / 2,
            xAlign: 'center',
            yAlign: 'top',
        };
    }

    return {
        x: x - (x - base) / 2,
        y: y - height / 2,
        xAlign: 'center',
        yAlign: 'bottom',
    };
};

const groupAndFitPrices = (data, centsPerPixel) => {
    // How many cents away should each label be from the next
    const increment = MIN_LABEL_DISTANCE_PX * centsPerPixel;

    if (!data?.length > 0) {
        return [];
    }

    data.sort((a, b) => a.price - b.price);
    let results = [];
    let groupedVal = data[0];

    // Use three points of precision, otherwise the rounding could compress the labels below the min distance on smaller time scales
    groupedVal.price = +(+groupedVal.price + increment / 2.0).toFixed(3);

    let top = +data[0].price + increment;
    for (let i = 1; i < data.length; i++) {
        if (+data[i].price > top) {
            results.push(groupedVal);

            groupedVal = data[i];
            groupedVal.price = +(+groupedVal.price + increment / 2.0).toFixed(3);

            top = +data[i].price + increment;
        } else {
            groupedVal.bid = +groupedVal.bid + +data[i].bid;
            groupedVal.ask = +groupedVal.ask + +data[i].ask;
            groupedVal.total = +groupedVal.total + +data[i].total;
        }
    }
    results.push(groupedVal);
    return results;
};

const convertToBidAskBarCoordinates = (row, isBid, highestVolume) => {
    const halfLength = (row.endingTimestamp - row.startingTimestamp) / 2.0;
    const midPoint = row.startingTimestamp + halfLength;

    let volumePercentile = (isBid ? row.bid : row.ask) / highestVolume;
    if (isNaN(volumePercentile)) {
        // highestVolume could be 0, in which case we don't want to show any bars
        volumePercentile = 0;
    }

    return [
        {
            x: [midPoint, midPoint + halfLength * 0.9 * (isBid ? -1 : 1) * volumePercentile],
            y: row.price,
        },
    ];
};

const convertToDeltaBarCoordinates = (row, highestVolume) => {
    const halfLength = (row.endingTimestamp - row.startingTimestamp) / 2.0;
    const midPoint = row.startingTimestamp + halfLength;

    let volumePercentile = (row.bid + row.ask) / highestVolume;
    if (isNaN(volumePercentile)) {
        // highestVolume could be 0, in which case we don't want to show any bars
        volumePercentile = 0;
    }

    return [
        {
            x: [midPoint, midPoint + halfLength * 0.9 * volumePercentile],
            y: row.price,
        },
    ];
};

export const filterOutliers = (rawData) => {
    return rawData.map((row) => {
        const newRow = { ...row };
        let orders = newRow['orders'];
        if (typeof orders === 'string') {
            orders = JSON.parse(newRow['orders']);
        }
        const prices = Object.keys(orders).map((price) => Number(price));

        const n = prices.length;
        const mean = prices.reduce((a, b) => a + b, 0) / n;
        const standardDeviation = Math.sqrt(
            prices.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / n,
        );
        const filteredPrices = prices.filter(
            (price) => price < mean + standardDeviation * 2 && price > mean - standardDeviation * 2,
        );
        orders = filteredPrices.reduce((acc, price) => ({ ...acc, [price]: orders[price] }), {});

        if (filteredPrices.length > 0) {
            const newLow = Math.min(...filteredPrices);
            const newHigh = Math.max(...filteredPrices);

            newRow.low = newLow;
            newRow.high = newHigh;
        }

        newRow.orders = orders;
        return newRow;
    });
};

export const getChartData = (rawData, centsPerPixel) => {
    // Convert to a list of individual orders with price and timestamp
    const flattenedData = rawData
        .map((row) => {
            let orders = row['orders'];
            if (typeof orders === 'string') {
                orders = JSON.parse(row['orders']);
            }
            return Object.entries(orders).map(([price, bidAsk]) => ({
                startingTimestamp: row['startingTimestamp'],
                endingTimestamp: row['endingTimestamp'],
                price: parseFloat(price).toFixed(2),
                bid: bidAsk.bid,
                ask: bidAsk.ask,
                total: parseFloat(bidAsk.total || 0).toFixed(2),
            }));
        })
        .flat();

    // Then for each time slice, group the data
    const coreData = Object.values(
        flattenedData.reduce(
            (acc, row) => ({
                ...acc,
                [row.startingTimestamp]: [...(acc[row.startingTimestamp] || []), row],
            }),
            {},
        ),
    )
        .map((timeSlice) => groupAndFitPrices(timeSlice, centsPerPixel))
        .flat()
        .sort((a, b) => {
            const tsDiff = a.startingTimestamp - b.startingTimestamp;
            if (tsDiff === 0) {
                return a.price - b.price;
            }
            return tsDiff;
        });

    const highestVolumeByTime = coreData.reduce(
        (acc, row) => ({
            ...acc,
            [row.startingTimestamp]: Math.max(acc[row.startingTimestamp] || 0, row.bid + row.ask),
        }),
        {},
    );

    const boxes = rawData
        .map((row) => {
            const startingTimestamp = row['startingTimestamp'];
            const endingTimestamp = row['endingTimestamp'];
            const length = endingTimestamp - startingTimestamp;

            // Clamp the open/close within the filtered row low/high
            const open = Math.max(row.low, Math.min(row.high, row['open']));
            const close = Math.min(row.high, Math.max(row.low, row['close']));

            const midPoint = startingTimestamp + length / 2;

            const boxTop = Math.max(open, close);
            const boxBottom = Math.min(open, close);
            const boxColor = close > open ? 'rgba(74, 207, 129, .15)' : 'rgba(230, 50, 98, .15)';

            // Delta calculation (difference between all bids and all asks)
            let orders = row['orders'];
            if (typeof orders === 'string') {
                orders = JSON.parse(row['orders']);
            }
            const delta = Object.values(orders).reduce((acc, row) => acc + row.ask - row.bid, 0);
            const showDelta = Math.sign(delta) !== Math.sign(close - open);

            const boxes = [
                {
                    type: 'box',
                    startingTimestamp: startingTimestamp,
                    xMin: startingTimestamp + length * 0.05,
                    xMax: startingTimestamp + length * 0.95,
                    yMin: boxBottom,
                    yMax: boxTop,
                    backgroundColor: boxColor,
                },
                {
                    type: 'line',
                    xMin: midPoint,
                    xMax: midPoint,
                    yMin: boxTop,
                    yMax: row['high'],
                    backgroundColor: boxColor,
                },
                {
                    type: 'line',
                    xMin: midPoint,
                    xMax: midPoint,
                    yMin: row['low'],
                    yMax: boxBottom,
                    backgroundColor: boxColor,
                },
            ];
            if (showDelta) {
                boxes.push({
                    type: 'label',
                    xValue: midPoint,
                    yValue: row['high'] + MIN_LABEL_DISTANCE_PX * centsPerPixel * 2.5,
                    content: 'Δ ' + delta,
                    color: '#ffc933',
                    font: {
                        family: 'monospace',
                    },
                });
            }
            return boxes;
        })
        .flat();

    return {
        datasets: coreData
            .map((row, index) => {
                const isHighestVolume =
                    highestVolumeByTime[row.startingTimestamp] === row.bid + row.ask;

                const neighborAbove = coreData[index + 1];
                const neighborBelow = coreData[index - 1];

                // Default to white
                let bidTextColor = 'rgba(255, 255, 255, .8)'; //white
                let askTextColor = 'rgba(255, 255, 255, .8)'; //white

                // if this is the highest volume, color the bid/ask text gold
                if (isHighestVolume) {
                    askTextColor = 'rgba(255, 201, 51, .75)'; //gold
                    bidTextColor = 'rgba(255, 201, 51, .75)'; //gold
                }


                if (neighborAbove && neighborAbove.startingTimestamp === row.startingTimestamp) {
                    const aboveBid = neighborAbove.bid;
                    
                    // if there is a datapoint above this one, and this rows ask is 3x the above bid price, color the ask text green
                    // if all of the above and this is the highest volume, color the ask text teal
                    if (row.ask > aboveBid * 3) {
                        askTextColor = isHighestVolume
                            ? 'rgba(83, 238, 244, .75)' //teal
                            : 'rgba(74, 207, 129, 1)'; //green
                    }
                }

                if (neighborBelow && neighborBelow.startingTimestamp === row.startingTimestamp) {
                    const belowAsk = neighborBelow.ask;
                    
                    // if there is a datapoint below this one, and this rows bid is 3x the below ask price, color the ask text red
                    // if all of the above and this is the highest volume, color the ask text teal
                    if (row.bid > belowAsk * 3) {
                        bidTextColor = isHighestVolume
                            ? 'rgba(83, 238, 244, .75)' //teal
                            : 'rgba(230, 50, 98, 1)'; //red
                    }
                }

                const rowDelta = +row.ask - +row.bid;
                return [
                    {
                        key: row.startingTimestamp + '_' + row.price + '_bid',
                        type: 'bar',
                        barThickness: 10,
                        barPercentage: 1.0,
                        categoryPercentage: 1.0,
                        borderWidth: 1,
                        borderSkipped: 'end',
                        backgroundColor: `rgba(230, 50, 98, .5)`, //red
                        borderColor: undefined,
                        data: convertToBidAskBarCoordinates(
                            row,
                            true,
                            highestVolumeByTime[row.startingTimestamp],
                        ),
                        order: 1,
                        dataType: 'bid',
                        bidAsk: { bid: row.bid, ask: row.ask },
                        total: row.total,
                        textColor: bidTextColor,
                        variant: 'BidAsk',
                    },
                    {
                        key: row.startingTimestamp + '_' + row.price + '_ask',
                        type: 'bar',
                        barThickness: 10,
                        barPercentage: 1.0,
                        categoryPercentage: 1.0,
                        borderWidth: 1,
                        borderSkipped: 'start',
                        backgroundColor: `rgba(74, 207, 129, .5)`, //green
                        borderColor: undefined,
                        data: convertToBidAskBarCoordinates(
                            row,
                            false,
                            highestVolumeByTime[row.startingTimestamp],
                        ),
                        order: 1,
                        dataType: 'ask',
                        bidAsk: { bid: row.bid, ask: row.ask },
                        total: row.total,
                        textColor: askTextColor,
                        variant: 'BidAsk',
                    },
                    {
                        key: row.startingTimestamp + '_' + row.price + '_delta',
                        type: 'bar',
                        barThickness: 10,
                        barPercentage: 1.0,
                        categoryPercentage: 1.0,
                        borderWidth: 1,
                        borderSkipped: 'start',
                        backgroundColor:
                            rowDelta > 0 ? 'rgba(74, 207, 129, 1)' : 'rgba(230, 50, 98, 1)', //green : red
                        data: convertToDeltaBarCoordinates(
                            row,
                            highestVolumeByTime[row.startingTimestamp],
                        ),
                        order: 1,
                        bidAsk: { bid: row.bid, ask: row.ask },
                        dataType: 'delta',
                        delta: rowDelta,
                        textColor: isHighestVolume
                            ? 'rgba(255, 201, 51, .75)' //gold
                            : rowDelta > 0
                            ? 'rgba(74, 207, 129, 1)' //green
                            : 'rgba(230, 50, 98, 1)', //red
                        variant: 'Delta',
                    },
                ];
            })
            .flat(),
        boxes: boxes,
        rawData,
    };
};

export const getOptions = (boxes = {}, timeframe) => {
    const times = boxes.filter((box) => box.type === 'box').map((box) => box.startingTimestamp);

    const interval = timeframe * MINUTES_TO_MILLIS;
    const start = Math.min(...times);
    const end = Math.max(...times);

    return {
        responsive: true,
        maintainAspectRatio: false,
        color: '#FFFFFF',
        indexAxis: 'y',
        interaction: {
            mode: 'point',
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                position: 'bottom',
                callbacks: {
                    label: (item, _) => {
                        const { bid, ask } = item.dataset.bidAsk;
                        return ['Over Bid:' + bid, 'Under Ask: ' + ask, 'Total: ' + (+bid + +ask)];
                    },
                },
            },
            annotation: {
                annotations: {
                    ...boxes,
                },
            },
            datalabels: {
                display: true,
                align: (value) => {
                    if (value.dataset.dataType === 'delta') {
                        return 'start';
                    }

                    return value.dataset.dataType === 'bid' ? 'start' : 'end';
                },
                anchor: (value) => {
                    if (value.dataset.dataType === 'delta') {
                        return 'start';
                    }

                    return value.dataset.dataType === 'bid' ? 'end' : 'start';
                },
                textAlign: 'center',
                color: (context) => {
                    return context.dataset.textColor;
                },
                font: {
                    size: '12',
                    weight: 'bold',
                    family: 'monospace',
                    lineHeight: 0.25,
                },
                formatter: (value, context) => {
                    if (context.dataset.dataType === 'delta') {
                        return '\n' + context.dataset.delta;
                    }

                    const { bid, ask } = context.dataset.bidAsk;
                    // Including a newline is a hack to get lineHeight to be accounted for, which vertically centers the text
                    return (
                        '\n' +
                        (context.dataset.dataType === 'bid' ? bid.toString() : ask.toString())
                    );
                },
            },
        },
        scales: {
            x: {
                type: 'linear',
                title: { text: 'Time', display: true, color: '#FFFFFF' },
                offset: false,
                beginAtZero: false,
                grace: 0,
                bounds: 'data',
                min: start,
                max: end + interval,
                ticks: {
                    color: '#FFFFFF',
                    callback: (value, _) => {
                        return dayjs.unix(value / 1000).format('h:mm:ssa');
                    },
                    font: {
                        family: 'monospace',
                        size: '12',
                    },
                    sampleSize: 2,
                },
                grid: {
                    display: true,
                    color: 'rgba(255, 255, 255, .25)',
                },
                afterBuildTicks: (axis) => {
                    // Fill in gaps so that the tick is still drawn
                    const newTimes = [];
                    let i = start;
                    while (i <= end) {
                        newTimes.push(i);
                        i += interval;
                    }

                    axis.ticks = newTimes.map((time) => ({ value: time }));
                },
            },
            y: {
                stacked: true,
                type: 'linear',
                title: { text: 'Price', display: true, color: '#FFFFFF' },
                offset: false,
                grade: '0%',
                ticks: {
                    precision: 2,
                    color: '#FFFFFF',
                    minRotation: 0,
                    maxRotation: 0,
                    sampleSize: 0,
                    font: {
                        family: 'monospace',
                        size: '12',
                    },
                },
                grid: {
                    display: true,
                    color: 'rgba(255, 255, 255, .25)',
                },
            },
        },
        animation: false,
    };
};
