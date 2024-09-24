import React, { useContext, useMemo, useEffect } from 'react';
// import { format } from "date-fns";
import Grid2 from '@mui/material/Unstable_Grid2';
import { DashboardItemContext } from '../../context/DashboardItemContext';
import { useQuery } from 'react-query';
import { DateSelector } from '../../infrastructure/DateSelector';
// import dayjs from 'dayjs';
import { StatusOverlay } from '../../infrastructure/StatusOverlay';
import { getVolumeProfile, INVALID_TICKER_MSG } from '../../api/apexApi';
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'


export default function VolumeProfile() {
    const dashboardItemContext = useContext(DashboardItemContext);
    const [dashboardItemState, dashboardItemDispatch] = Array.isArray(dashboardItemContext)
        ? dashboardItemContext
        : [];
    const ticker = dashboardItemState?.ticker || 'SPY';
    // const selectedDateStr = (dashboardItemState?.selectedDate || dayjs.tz()).format('YYYY/MM/DD');

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
        [ticker, 'volumeProfile'],
        () =>
            getVolumeProfile(ticker).then((result) => {
                if (result === INVALID_TICKER_MSG) {
                    throw new Error('Invalid ticker.');
                }

                if (result.data) {
                    return {
                        volumeProfileData: result,
                    };
                } else {
                    throw new Error('Server error, please try again later.');
                }
            }),
        {
            cacheTime: 1000 * 30, // 0.5 minute
            staleTime: 1000 * 30, // 0.5 minute
            refetchInterval: 1000 * 30, // 0.5 minute
            keepPreviousData: true,
            retry: false,
        },
    );
    const { volumeProfileData } = queryData || { volumeProfileData: {data:{}} };


    const options = useMemo(() => {
        let VPSpot;
        if(volumeProfileData.labels !== undefined){
            for(var i = 0; i < volumeProfileData.labels.length; i++){
                if(volumeProfileData.labels[i] > volumeProfileData.spotPrice && volumeProfileData.labels[i+1] < volumeProfileData.spotPrice){
                    VPSpot = [i, `Spot Price: ${volumeProfileData.spotPrice}`];
                }
            }
        }
        if(VPSpot === undefined){
            VPSpot = [0, `Spot Price: 0`];
        }
        return {
            chart: {
                type: 'bar',
                backgroundColor :'null',
                zoomType: 'xy',
                height: 491,
            },
            legend: {
                verticalAlign: 'top',
                align: 'center',
                floating: true,
                itemStyle: {
                    color: '#fff'
                }
            },
            xAxis: {
                type: 'linear',
                gridLineColor: 'rgba(255,255,255,0.3)',
                categories: volumeProfileData.labels,
                labels: {
                    style: {
                        color: '#fff'
                    },
                },
                plotLines: [{
                    value: VPSpot[0],
                    color: '#E6038C',
                    dashStyle: 'longdash',
                    zIndex: 100,
                    width: 2,
                    label: {
                        align: 'right',
                        text: VPSpot[1],
                        style: {
                            color: '#fff',
                            zIndex: 100,

                        },
                    }
                }]
            },
            yAxis: { // Primary yAxis
                // min: 0,
                // max: 1.2,
                labels: {
                    format: '{value}',
                    style: {
                        color: '#fff'
                    }
                },
                title: {
                    text: ``,
                    style: {
                        color: '#00E272'
                    }
                },
                opposite: false,
                gridLineColor: 'rgba(255,255,255,0.1)',
            },
            tooltip: {
                shared: true
            },
            credits: {
                enabled: false
            },
            title: {
                text: '',
                style:{
                    color: 'white',
                },
                align: 'left'
            },
            series: [
              {
                name: `${ticker} Volume Profile`,
                data: volumeProfileData.data,
                color: '#00E272',
                borderWidth: 0,
                zones: [{
                    value: 0.2,
                    color: 'rgba(255,255,255, 0.3)'
                },
                {
                    color: '#00E272'
                }
            ]
              }
            ],
          };
    }, [volumeProfileData, ticker]);

    return (
        <div style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%' }}>
            <Grid2 container spacing={2} maxWidth={'100%'} paddingTop={'8px'} height={'100%'}>
                <Grid2
                    xs={12}
                    position={'relative'}
                    sx={{ maxHeight: '100%', paddingBottom: '0px', paddingRight: '0px' }}
                >
                    <StatusOverlay loading={loading || !volumeProfileData} error={error}/>
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <HighchartsReact
                        highcharts={Highcharts}
                        options={options}
                        />
                    </div>
                </Grid2>
            </Grid2>
        </div>
    );
}
