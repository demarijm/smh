export const tickerMetadata = {
    SPX: {
        value: 'SPX',
        spotMultiplier: 0.025,
        label: 'SPX',
    },
    SPX_OPEX: {
        value: 'SPX',
        spotMultiplier: 0.0375,
        label: 'SPX (OPEX)',
        modifier: 'OPEX',
    },
    SPY: {
        value: 'SPY',
        spotMultiplier: 0.05,
        label: 'SPY',
    },
    QQQ: {
        value: 'QQQ',
        spotMultiplier: 0.05,
        label: 'QQQ',
    },
};

export const minMaxByStdDeviation = (xAxisMean, points) => {
    if (points.length === 0) {
        return [0, 0];
    }

    // https://www.itl.nist.gov/div898/software/dataplot/refman2/ch2/weightsd.pdf
    const squaredDifferenceSum =
        points.reduce((partialSum, a) => partialSum + (xAxisMean - a.x) ** 2 * Math.abs(a.y), 0) +
        Number.EPSILON;
    const weightsSum =
        points.reduce((partialSum, a) => partialSum + Math.abs(a.y), 0) + Number.EPSILON;
    const nonZeroWeightCounts = points.filter((a) => Math.abs(a.y) > 0).length;
    const denominator = (weightsSum * (nonZeroWeightCounts - 1)) / nonZeroWeightCounts;

    const xAxisStdDev = Math.sqrt(squaredDifferenceSum / denominator);
    return [xAxisMean - xAxisStdDev, xAxisMean + xAxisStdDev];
};

export function findClosestArrayValue(array, value) {
    if (!array?.length) {
        return;
    }

    return array.reduce((a, b) => {
        return Math.abs(b - value) < Math.abs(a - value) ? b : a;
    });
}

export const checkMinStrikeDistance = (array, initialMin, initialMax, distance) => {
    const q1Strike = findClosestArrayValue(array, initialMin);
    let q1Index = array.indexOf(q1Strike);
    const q3Strike = findClosestArrayValue(array, initialMax);
    let q3Index = array.indexOf(q3Strike);
    const maxIndex = array.length;

    while (q3Index - q1Index < distance) {
        if ((q3Index - q1Index) % 2 === 0 && q1Index > 0) {
            q1Index--;
        } else if (q3Index < maxIndex - 1) {
            q3Index++;
        } else {
            break;
        }
    }

    const xMin = array[q1Index];
    const xMax = array[q3Index];
    return [xMin, xMax];
};

export function objectMap(object, mapFn) {
    return Object.keys(object).reduce(function (result, key) {
        result[key] = mapFn(object[key]);
        return result;
    }, {});
}
