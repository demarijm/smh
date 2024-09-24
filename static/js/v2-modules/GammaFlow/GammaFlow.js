import React, { useContext, useMemo, useEffect } from 'react';
import { format } from "date-fns";
import Grid2 from '@mui/material/Unstable_Grid2';
import { DashboardItemContext } from '../../context/DashboardItemContext';
import { useQuery } from 'react-query';
import { DateSelector } from '../../infrastructure/DateSelector';
import dayjs from 'dayjs';
import { StatusOverlay } from '../../infrastructure/StatusOverlay';
import { TransitionGroup } from 'react-transition-group';
import { getGammaTide, INVALID_TICKER_MSG } from '../../api/apexApi';
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'


export default function GammaFlow() {
    const dashboardItemContext = useContext(DashboardItemContext);
    const [dashboardItemState, dashboardItemDispatch] = Array.isArray(dashboardItemContext)
        ? dashboardItemContext
        : [];
    const ticker = dashboardItemState?.ticker || 'SPY';
    const selectedDateStr = (dashboardItemState?.selectedDate || dayjs.tz()).format('YYYY/MM/DD');

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
        [ticker, 'gammaFlow'],
        () =>
            getGammaTide(ticker, selectedDateStr).then((result) => {
                if (result === INVALID_TICKER_MSG) {
                    throw new Error('Invalid ticker.');
                }

                if (result.data) {
                    return {
                        gammaFlowData: result,
                    };
                } else {
                    throw new Error('Server error, please try again later.');
                }
            }),
        {
            cacheTime: 1000 * 10, // 1 minute
            staleTime: 1000 * 10, // 1 minute
            refetchInterval: 1000 * 10, // 1 minute
            keepPreviousData: true,
            retry: false,
        },
    );
    const { gammaFlowData } = queryData || { gammaFlowData: {data:{}} };


    const options2 = useMemo(() => {
        return {
           
            chart: {
                zooming: {
                    type: 'xy'
                },
                backgroundColor :'null',
                height:491

            },
            legend: {
                verticalAlign: 'top',
                align: 'center',
                floating: true,
                itemStyle: {
                    color: '#fff'
                }
            },
            xAxis: [{
                // type: 'datetime',
                crosshair: true,
                gridLineColor: 'rgba(255,255,255,0.3)',
                categories: gammaFlowData.labels,
                labels: {
                    align: 'right',
                    style: {
                        color: '#fff'
                    },
                    formatter: function() {
                        return format(new Date(this.value), 'p');
                    },
                }
            }],
            yAxis: [{ // Primary yAxis
                labels: {
                    format: '{value}',
                    style: {
                        color: Highcharts.getOptions().colors[2]
                    }
                },
                title: {
                    text: 'Underlying Price',
                    style: {
                        color: Highcharts.getOptions().colors[2]
                    }
                },
                opposite: true,
                height: '70%',
                gridLineColor: 'rgba(255,255,255,0.3)',
        
            }, { // Secondary yAxis
                gridLineWidth: 0,
                title: {
                    text: 'Net Gamma',
                    style: {
                        color: '#fff',
                    }
                },
                labels: {
                    format: '{value} B',
                    style: {
                        color: "#fff",
                    }
                },
                opposite: true,
                height: '30%',
                top: '70%',
                offset: 0,
                showLastLabel: false,
                softMin: 0,
                
        
            }],
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
            // plotOptions: {
            //     series: {
            //      data: gammaFlowData.labels
            //     }
            // },
            series: [
              {
                name: 'Net Gamma',
                type: 'area',
                yAxis: 1,
                data: gammaFlowData.data.absDGEXGamma,
                tooltip: {
                    valueSuffix: ''
                },
                color: '#00E272',
                negativeColor: '#E63262',
                marker: {
                    enabled: false
                }
              },
                {
                    name: 'Spot Price',
                    type: 'spline',
                    data: gammaFlowData.data.spotPrice,
                    tooltip: {
                        valueSuffix: ''
                    },
                    color: '#00E272',
                    marker: {
                        enabled: false
                    }

                },
                {
                    name:`Primary`,
                    type: 'spline',
                    data: gammaFlowData.data.absDGEX1,
                    color: '#E6038C',
                    marker: {
                        enabled: false
                    }
                  },
                  {
                    name:`Secondary`,
                    type: 'spline',
                    data: gammaFlowData.data.absDGEX2,
                    color: '#00e5ff',
                    marker: {
                        enabled: false
                    }
                  },
            ],
          };
    }, [gammaFlowData]);
    return (
        <div
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                maxWidth: '100%',
                maxHeight: '100%',
            }}
        >
            <StatusOverlay error={error} loading={loading || !gammaFlowData} />
            <Grid2
                container
                maxWidth={'100%'}
                padding={'8px'}
                height={'100%'}
                sx={{ overflowY: 'auto' }}
            >
                <TransitionGroup component={null}>
               
                <div  style={{
                position: 'relative',
                width: '100%',
                maxWidth: '100%',
            }}>
                <HighchartsReact
                    highcharts={Highcharts}
                    options={options2}
                />
                </div>
                </TransitionGroup>
            </Grid2>
        </div>
    );
}
