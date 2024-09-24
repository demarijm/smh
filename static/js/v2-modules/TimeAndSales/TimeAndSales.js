import React, { useCallback, useContext, useEffect, useReducer, useRef, useState } from 'react';
import Grid2 from '@mui/material/Unstable_Grid2';
import TableRow from './TableRow/TableRow';
import { DashboardItemContext } from '../../context/DashboardItemContext';
import { MenuItem, Select, Typography } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { TransitionGroup } from 'react-transition-group';
import { flowSocketService, SOCKET_TYPE } from '../../infrastructure/SocketService';
import { StatusOverlay } from '../../infrastructure/StatusOverlay';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

export default function TimeAndSales() {
    const [renderKey, rerender] = useReducer((x) => ++x, 0);
    const [socketLoading, setSocketLoading] = useState(true);
    const [socketError, setSocketError] = useState(undefined);
    const [tapeFlow, updateTapeFlow] = useState([]);
    const [currentTickerVolume, updatecurrentTickerVolume] = useState('Loading...');
    const [currentTickerOpen, updatecurrentTickerOpen] = useState('Loading...');
    const [currentTickerVWAP, updatecurrentTickerVWAP] = useState('Loading...');
    const dashboardItemContext = useContext(DashboardItemContext);
    const [dashboardItemState, dashboardItemDispatch] = Array.isArray(dashboardItemContext)
        ? dashboardItemContext
        : [];
    const ticker = dashboardItemState?.ticker || 'SPY';
    const lotFilter =
        dashboardItemState?.lotFilter !== undefined ? dashboardItemState.lotFilter : 100;
    const updateLotFilter = useCallback(
        (value) => dashboardItemDispatch({ type: 'setLotFilter', lotFilter: value }),
        [dashboardItemDispatch],
    );

    useEffect(() => {
        dashboardItemDispatch({
            type: 'setCustomActions',
            customActions: [
                {
                    component: Select,
                    props: {
                        key: 'lot-select',
                        value: lotFilter,
                        onChange: (event) => updateLotFilter(event?.target?.value),
                        IconComponent: ArrowDropDownIcon,
                        sx: {
                            alignSelf: 'center',
                            maxHeight: '31px',
                            width: '100%',
                            '& .MuiSelect-select': {
                                color: '#fff',
                            },
                            '& .MuiSvgIcon-root': {
                                color: '#fff',
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                background: 'rgba(255,255,255,0.05)',
                                borderColor: '#FFFFFF',
                            },
                        },
                        children: [
                            <MenuItem key={0} value={0}>
                                All
                            </MenuItem>,
                            <MenuItem key={50} value={50}>
                                50+
                            </MenuItem>,
                            <MenuItem key={100} value={100}>
                                100+
                            </MenuItem>,
                            <MenuItem key={500} value={500}>
                                500+
                            </MenuItem>,
                            <MenuItem key={1000} value={1000}>
                                1000+
                            </MenuItem>,
                            <MenuItem key={2000} value={2000}>
                                2000+
                            </MenuItem>,
                        ],
                    },
                },
            ],
        });
    }, [dashboardItemDispatch, lotFilter, updateLotFilter]);

    const addTickerData = useCallback(
        (newTickerData) => {
            let data = newTickerData;
            if (data === 'INVALID_TICKER') {
                setSocketError({ message: 'Invalid ticker' });
            } else if (data.ev === 'T' && data.s >= lotFilter) {
                let currentSaleData = {
                    id: data.i,
                    ticker: data.sym,
                    price: data.p,
                    size: data.s,
                    sentiment: data.tradeSentiment,
                    sentimentStyle: data.tradeSentiment,
                    value: formatter.format(data.p * data.s),
                    timestamp: data.t,
                    vwapApproach: Math.abs(data?.vol?.vwapDistance) <= 0.25,
                };
                updateTapeFlow((tapeFlow) => [currentSaleData, ...tapeFlow.slice(0, 50)]);
                updatecurrentTickerVolume(data?.vol?.av || 'Loading...');
                updatecurrentTickerOpen(data?.vol?.op || 'Loading...');
                updatecurrentTickerVWAP(data?.vol?.vwap || 'Loading...');
            }
        },
        [
            updateTapeFlow,
            updatecurrentTickerVolume,
            updatecurrentTickerOpen,
            updatecurrentTickerVWAP,
            lotFilter,
        ],
    );
    const addTickerDataRef = useRef(addTickerData);
    useEffect(() => {
        addTickerDataRef.current = addTickerData;
    }, [addTickerData]);

    useEffect(() => {
        updateTapeFlow([]);
        const socket = flowSocketService.subscribe(
            SOCKET_TYPE.TAPE,
            ticker,
            addTickerDataRef,
            setSocketLoading,
            setSocketError,
        );

        // CLEAN UP THE EFFECT
        return () => {
            updateTapeFlow([]);
            updatecurrentTickerVolume('Loading...');
            updatecurrentTickerOpen('Loading...');
            updatecurrentTickerVWAP('Loading...');
            flowSocketService.unsubscribe(SOCKET_TYPE.TAPE, ticker, socket);
            rerender();
        };
    }, [ticker]);

    useEffect(() => {
        if(tapeFlow.length >=200) {
        updateTapeFlow(tapeFlow.slice(0, 100));
        }
    }, [tapeFlow]);

    const listItems = tapeFlow.map((row) => (
        <div key={row.id}>
            <TableRow
                key={row.id}
                rowData={{
                    timestamp: row.timestamp,
                    price: row.price,
                    size: row.size,
                    sentiment: row.sentiment,
                    value: row.value,
                    vwap: row.vwapApproach,
                }}
            />
        </div>
    ));

    return (
        <>
            <StatusOverlay loading={socketLoading} error={socketError} />
            <Grid2 container>
                <Grid2 container xs={12} md={12} sx={{ margin: '10px' }}>
                    <Grid2 key={'volume-header'} xs={12} md={4}>
                        <Card
                            sx={{
                                height: '50px',
                                backgroundColor: 'transparent',
                                backgroundImage:
                                    'radial-gradient(circle,rgba(255, 255, 255, .05), rgba(0, 0, 0, .00))',
                            }}
                        >
                            <CardContent sx={{ paddingTop: 0, paddingBottom: '8px !important' }}>
                                <Typography
                                    sx={{
                                        fontSize: 14,
                                        fontWeight: 'bold',
                                        marginTop: '5px',
                                        marginBottom: '0px',
                                        paddingBottom: '0px',
                                    }}
                                    color="#fff"
                                    gutterBottom
                                >
                                    Daily Volume:
                                </Typography>
                                <Typography sx={{ fontSize: 12 }} color="#fff" gutterBottom>
                                    {currentTickerVolume.toLocaleString('en-US')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid2>
                    <Grid2 key={'open-header'} xs={12} md={4}>
                        <Card
                            sx={{
                                height: '50px',
                                backgroundColor: 'transparent',
                                backgroundImage:
                                    'radial-gradient(circle,rgba(255, 255, 255, .05), rgba(0, 0, 0, .00))',
                            }}
                        >
                            <CardContent sx={{ paddingTop: 0, paddingBottom: '8px !important' }}>
                                <Typography
                                    sx={{
                                        fontSize: 14,
                                        fontWeight: 'bold',
                                        marginTop: '5px',
                                        marginBottom: '0px',
                                        paddingBottom: '0px',
                                    }}
                                    color="#fff"
                                    gutterBottom
                                >
                                    Open Price:
                                </Typography>
                                <Typography sx={{ fontSize: 12 }} color="#fff" gutterBottom>
                                    {currentTickerOpen}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid2>
                    <Grid2 key={'vwap-header'} xs={12} md={4}>
                        <Card
                            sx={{
                                height: '50px',
                                backgroundColor: 'transparent',
                                backgroundImage:
                                    'radial-gradient(circle,rgba(255, 255, 255, .05), rgba(0, 0, 0, .00))',
                            }}
                        >
                            <CardContent sx={{ paddingTop: 0, paddingBottom: '8px !important' }}>
                                <Typography
                                    sx={{
                                        fontSize: 14,
                                        fontWeight: 'bold',
                                        marginTop: '5px',
                                        marginBottom: '0px',
                                        paddingBottom: '0px',
                                    }}
                                    color="#E6038C"
                                    gutterBottom
                                >
                                    VWAP:
                                </Typography>
                                <Typography sx={{ fontSize: 12 }} color="#E6038C" gutterBottom>
                                    {currentTickerVWAP}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid2>
                    {!socketLoading && !socketError && listItems.length === 0 && (
                        <Typography
                            variant={'h4'}
                            sx={{
                                color: 'rgba(255, 255, 255, 0.5)',
                                position: 'relative',
                                top: '5%',
                                left: '50%',
                                display: 'inline-flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textAlign: 'center',
                                transform: 'translate(-50%, 0%)',
                            }}
                        >
                            waiting for data...
                        </Typography>
                    )}
                    <Grid2 key={'orders' + renderKey} xs={12} sx={{ margin: '10px' }}>
                        <TransitionGroup>{listItems}</TransitionGroup>
                    </Grid2>
                </Grid2>
            </Grid2>
        </>
    );
}
