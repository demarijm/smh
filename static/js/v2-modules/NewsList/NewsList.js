import React, { useContext } from 'react';
import Grid2 from '@mui/material/Unstable_Grid2';
import NewsArticle from './NewsArticle/NewsArticle';
import { DashboardItemContext } from '../../context/DashboardItemContext';
import { useQuery } from 'react-query';
import { StatusOverlay } from '../../infrastructure/StatusOverlay';
import { TransitionGroup } from 'react-transition-group';
import { Slide } from '@mui/material';
import { getNews, INVALID_TICKER_MSG } from '../../api/apexApi';

export default function NewsList() {
    const dashboardItemContext = useContext(DashboardItemContext);
    const dashboardItemState = Array.isArray(dashboardItemContext) && dashboardItemContext[0];
    const ticker = dashboardItemState?.ticker || 'SPX';

    const {
        isFetching: loading,
        error,
        data: queryData,
    } = useQuery(
        [ticker, 'news'],
        () =>
            getNews(ticker).then((result) => {
                if (result === INVALID_TICKER_MSG) {
                    throw new Error('Invalid ticker.');
                }

                if (result.items) {
                    return {
                        newsData: result.items,
                    };
                } else {
                    throw new Error('Server error, please try again later.');
                }
            }),
        {
            cacheTime: 1000 * 60, // 1 minute
            staleTime: 1000 * 60, // 1 minute
            refetchInterval: 1000 * 60, // 1 minute
            keepPreviousData: true,
            retry: false,
        },
    );
    const { newsData } = queryData || { newsData: [] };

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
            <StatusOverlay error={error} loading={loading || !newsData} />
            <Grid2
                container
                maxWidth={'100%'}
                padding={'8px'}
                height={'100%'}
                sx={{ overflowY: 'auto' }}
            >
                <TransitionGroup component={null}>
                    {newsData?.slice(0, 15).map((d) => (
                        <Slide key={d.title} direction={'left'}>
                            <div style={{ width: '100%' }}>
                                <NewsArticle
                                    key={d.title}
                                    title={d.title}
                                    date={d.pubDate}
                                    link={d.link}
                                />
                            </div>
                        </Slide>
                    ))}
                </TransitionGroup>
            </Grid2>
        </div>
    );
}
