import { BaseIndicatorChart } from './BaseIndicatorChart';
import { checkMinStrikeDistance, minMaxByStdDeviation, tickerMetadata } from '../util/utils';
import { DdoiChart } from './DdoiChart';

const getChartRangeByStdDev = (optionsData, spotPrice, callsId, putsId, strikes) => {
    let [callsMin, callsMax] = minMaxByStdDeviation(
        spotPrice,
        Object.entries(optionsData || {}).map(([strike, contract]) => {
            return { x: parseFloat(strike), y: contract[callsId] || 0 };
        }),
    );

    // Ensure min and max strike are at least 20 strikes away from each other
    [callsMin, callsMax] = checkMinStrikeDistance(strikes, callsMin, callsMax, 20);

    let [putsMin, putsMax] = minMaxByStdDeviation(
        spotPrice,
        Object.entries(optionsData || {}).map(([strike, contract]) => {
            return { x: parseFloat(strike), y: contract[putsId] || 0 };
        }),
    );
    // Ensure min and max strike are at least 20 strikes away from each other
    [putsMin, putsMax] = checkMinStrikeDistance(strikes, putsMin, putsMax, 20);

    return [Math.min(callsMin, putsMin), Math.max(callsMax, putsMax)];
};

const getChartRangeByMultiplier = (optionsData, spotPrice, callsId, putsId, strikes, ticker) => {
    const tickerMultiplier = tickerMetadata[ticker]?.spotMultiplier || 0.2;

    let [xMin, xMax] = checkMinStrikeDistance(
        strikes,
        spotPrice * (1 - tickerMultiplier),
        spotPrice * (1 + tickerMultiplier),
        20,
    );

    xMin = Math.max(Math.min(...strikes), xMin);
    xMax = Math.min(Math.max(...strikes), xMax);
    return [xMin, xMax];
};

const optionsItemTemplate = (id, label) => {
    return {
        indicatorLabel: label,
        callsId: `Call${id}`,
        putsId: `Put${id}`,
        netId: `Total${label}`,
        getChartRange: getChartRangeByStdDev,
    };
};

const INDICATORS = {
    DEX: optionsItemTemplate('DEX', 'Delta'),
    THEX: optionsItemTemplate('THEX', 'Theta'),
    LEX: optionsItemTemplate('LEX', 'Lambda'),
    VEGEX: optionsItemTemplate('VEGEX', 'Vega'),
    REX: optionsItemTemplate('REX', 'Rho'),
    GEX: {
        ...optionsItemTemplate('GEX', 'Gamma'),
        showIV: true,
        variants: [
            { id: 'GammaSkewed', label: 'Skew-Adj' },
            { id: 'DGEX', label: 'Delta-Adj' },
        ],
    },
    VEX: { ...optionsItemTemplate('VEX', 'Vanna'), getChartRange: getChartRangeByMultiplier },
    CHEX: optionsItemTemplate('CHEX', 'Charm'),
    VOEX: optionsItemTemplate('VOEX', 'Vomma'),
    VEEX: optionsItemTemplate('VEEX', 'Veta'),
    SPEX: optionsItemTemplate('SPEX', 'Speed'),
    ZEX: optionsItemTemplate('ZEX', 'Zomma'),
    COEX: optionsItemTemplate('COEX', 'Color'),
    UEX: optionsItemTemplate('UEX', 'Ultima'),
};

export const ChartList = ({ indicator, ...chartProps }) => {
    if (Object.keys(INDICATORS).includes(indicator)) {
        return <BaseIndicatorChart {...INDICATORS[indicator]} {...chartProps} />;
    } else {
        return <DdoiChart getChartRange={getChartRangeByStdDev} {...chartProps} />;
    }
};
