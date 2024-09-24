import { ChartList } from '../chart/ChartList';
import NewsList from '../v2-modules/NewsList/NewsList';
import GammaFlow from '../v2-modules/GammaFlow/GammaFlow';
import VolumeProfile from '../v2-modules/VolumeProfile/VolumeProfile';
import TimeAndSales from '../v2-modules/TimeAndSales/TimeAndSales';
import Top10Market from '../v2-modules/Market/Market';
import Top10Darkpool from '../v2-modules/Darkpool/Darkpool';
import UnusualOptions from '../v2-modules/OptionsFlow/UnusualOptions';
import { FootprintChart } from '../chart/footprint/FootprintChart';
import GammaSummary from '../v2-modules/GammaSummary/GammaSummary';

const optionsItemTemplate = (id, label) => {
    return {
        id: id,
        title: `${label} Exposure`,
        group: ITEM_GROUPS.GREEKS,
        defaultTicker: 'SPX',
        component: ChartList,
        dashboardProps: { indicator: id, showSplitNet: true },
    };
};

const ITEM_GROUPS = {
    GENERAL: {
        id: 'GENERAL',
        title: 'General',
        order: 0,
    },
    TAPE: {
        id: 'TAPE',
        title: 'Tape',
        order: 1,
    },
    OPTIONS: {
        id: 'OPTIONS',
        title: 'Options',
        order: 2,
    },
    GREEKS: {
        id: 'GREEKS',
        title: 'Greeks',
        order: 3,
    },
};

const ALL_ITEMS = {
    FOOTPRINT: {
        id: 'FOOTPRINT',
        title: 'Footprint (Beta)',
        group: ITEM_GROUPS.TAPE,
        defaultTicker: 'SPY',
        component: FootprintChart,
    },
    TIMEANDSALES: {
        id: 'TIMEANDSALES',
        title: 'Time & Sales',
        group: ITEM_GROUPS.TAPE,
        defaultTicker: 'SPY',
        component: TimeAndSales,
    },
    VOLUMEPROFILE: {
        id: 'VOLUMEPROFILE',
        title: 'Volume Profile',
        group: ITEM_GROUPS.TAPE,
        defaultTicker: 'SPX',
        component: VolumeProfile,
    },
    TOP10MARKET: {
        id: 'TOPMARKET',
        title: 'Top Market Orders',
        group: ITEM_GROUPS.TAPE,
        defaultTicker: 'SPY',
        component: Top10Market,
    },
    TOP10DARKPOOL: {
        id: 'TOPDARKPOOL',
        title: 'Top Darkpool Orders',
        group: ITEM_GROUPS.TAPE,
        defaultTicker: 'SPY',
        component: Top10Darkpool,
    },
    NEWS: {
        id: 'NEWS',
        title: 'News',
        group: ITEM_GROUPS.GENERAL,
        defaultTicker: 'SPX',
        component: NewsList,
    },
    UNUSUALOPTIONS: {
        id: 'UNUSUALOPTIONS',
        title: 'Unusual Options',
        group: ITEM_GROUPS.OPTIONS,
        defaultTicker: 'SPY',
        component: UnusualOptions,
    },
    GAMMASUMMARY: {
        id: 'GAMMASUMMARY',
        title: `APEX AI`,
        group: ITEM_GROUPS.GREEKS,
        defaultTicker: 'SPX',
        component: GammaSummary,
    },
    GAMMAFLOW: {
        id: 'GAMMAFLOW',
        title: 'Gamma Flow',
        group: ITEM_GROUPS.GREEKS,
        defaultTicker: 'SPX',
        component: GammaFlow,
    },
    DDOI: {
        id: 'DDOI',
        title: 'Dealer Directional Open Interest',
        group: ITEM_GROUPS.OPTIONS,
        defaultTicker: 'SPX',
        component: ChartList,
        dashboardProps: { indicator: 'DDOI', showSplitNet: false },
    },
    GEX: optionsItemTemplate('GEX', 'Gamma'),
    VEX: optionsItemTemplate('VEX', 'Vanna'),
    CHEX: optionsItemTemplate('CHEX', 'Charm'),
    DEX: optionsItemTemplate('DEX', 'Delta'),
    SPEX: optionsItemTemplate('SPEX', 'Speed'),
    THEX: optionsItemTemplate('THEX', 'Theta'),
    LEX: optionsItemTemplate('LEX', 'Lambda'),
    VEGEX: optionsItemTemplate('VEGEX', 'Vega'),
    REX: optionsItemTemplate('REX', 'Rho'),
    VOEX: optionsItemTemplate('VOEX', 'Vomma'),
    VEEX: optionsItemTemplate('VEEX', 'Veta'),
    ZEX: optionsItemTemplate('ZEX', 'Zomma'),
    COEX: optionsItemTemplate('COEX', 'Color'),
    UEX: optionsItemTemplate('UEX', 'Ultima'),
};

export const getItemGroups = () => {
    return ITEM_GROUPS;
};

export const getAllItems = () => {
    return Object.values(ALL_ITEMS);
};

export const getInitialItems = () => {
    return [
        ALL_ITEMS['GEX'],
        ALL_ITEMS['VEX'],
        ALL_ITEMS['DEX'],
        ALL_ITEMS['TIMEANDSALES'],
        ALL_ITEMS['DDOI'],
        ALL_ITEMS['TOP10DARKPOOL'],
        ALL_ITEMS['TOP10MARKET'],
        ALL_ITEMS['UNUSUALOPTIONS'],
    ];
};

export const getInitialLayout = () => {
    return {
        lg: [
            {
                w: 4,
                h: 5,
                x: 0,
                y: 0,
                i: 'GEX',
                minW: 4,
                minH: 4,
                moved: false,
                static: false,
                isBounded: true,
            },
            {
                w: 4,
                h: 5,
                x: 4,
                y: 0,
                i: 'VEX',
                minW: 4,
                minH: 4,
                moved: false,
                static: false,
                isBounded: true,
            },
            {
                w: 4,
                h: 5,
                x: 8,
                y: 0,
                i: 'DEX',
                minW: 4,
                minH: 4,
                moved: false,
                static: false,
                isBounded: true,
            },
            {
                w: 4,
                h: 8,
                x: 0,
                y: 5,
                i: 'TIMEANDSALES',
                minW: 4,
                minH: 4,
                moved: false,
                static: false,
                isBounded: true,
            },
            {
                w: 4,
                h: 8,
                x: 4,
                y: 5,
                i: 'DDOI',
                minW: 4,
                minH: 4,
                moved: false,
                static: false,
                isBounded: true,
            },
            {
                w: 4,
                h: 4,
                x: 8,
                y: 5,
                i: 'TOP10DARKPOOL',
                minW: 4,
                minH: 4,
                moved: false,
                static: false,
                isBounded: true,
            },
            {
                w: 4,
                h: 4,
                x: 8,
                y: 9,
                i: 'TOP10MARKET',
                minW: 4,
                minH: 4,
                moved: false,
                static: false,
                isBounded: true,
            },
            {
                w: 12,
                h: 6,
                x: 0,
                y: 13,
                i: 'UNUSUALOPTIONS',
                minW: 4,
                minH: 4,
                moved: false,
                static: false,
                isBounded: true,
            },
        ],
        md: [
            {
                w: 4,
                h: 5,
                x: 0,
                y: 0,
                i: 'GEX',
                minW: 4,
                minH: 4,
                moved: false,
                static: false,
                isBounded: true,
            },
            {
                w: 4,
                h: 5,
                x: 4,
                y: 0,
                i: 'VEX',
                minW: 4,
                minH: 4,
                moved: false,
                static: false,
                isBounded: true,
            },
            {
                w: 4,
                h: 5,
                x: 4,
                y: 5,
                i: 'DEX',
                minW: 4,
                minH: 4,
                moved: false,
                static: false,
                isBounded: true,
            },
            {
                w: 4,
                h: 5,
                x: 0,
                y: 5,
                i: 'TIMEANDSALES',
                minW: 4,
                minH: 4,
                moved: false,
                static: false,
                isBounded: true,
            },
            {
                w: 4,
                h: 8,
                x: 4,
                y: 10,
                i: 'DDOI',
                minW: 4,
                minH: 4,
                moved: false,
                static: false,
                isBounded: true,
            },
            {
                w: 4,
                h: 4,
                x: 0,
                y: 10,
                i: 'TOP10DARKPOOL',
                minW: 4,
                minH: 4,
                moved: false,
                static: false,
                isBounded: true,
            },
            {
                w: 4,
                h: 4,
                x: 0,
                y: 14,
                i: 'TOP10MARKET',
                minW: 4,
                minH: 4,
                moved: false,
                static: false,
                isBounded: true,
            },
            {
                w: 8,
                h: 6,
                x: 0,
                y: 18,
                i: 'UNUSUALOPTIONS',
                minW: 4,
                minH: 4,
                moved: false,
                static: false,
                isBounded: true,
            },
        ],
    };
};
