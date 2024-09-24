import React, { useContext } from 'react';
import Grid2 from '@mui/material/Unstable_Grid2';
import { DashboardItemContext } from '../../context/DashboardItemContext';
import { useQuery } from 'react-query';
import { StatusOverlay } from '../../infrastructure/StatusOverlay';
import { getGammaSummary } from '../../api/apexApi';
import { tickerMetadata } from '../../util/utils';
import SummaryItem from './SummaryItem/SummaryItem';

function generatePriceTarget(ticker, AOI, spotPrice){
    let priceTarget;
    if(ticker === 'SPX'){
        if(AOI > spotPrice){
            priceTarget = AOI - 5;
        }else{
            priceTarget = AOI + 5;
        }

        return priceTarget;
    } else{
        return 'unavailable';
    }
}

export default function GammaSummary() {
    const dashboardItemContext = useContext(DashboardItemContext);
    const dashboardItemState = Array.isArray(dashboardItemContext) && dashboardItemContext[0];
    const ticker = dashboardItemState?.ticker || 'SPX';

    const {
        isFetching: loading,
        error,
        data: queryData,
    } = useQuery(
        [ticker, 'gammaSummary'],
        () =>
            getGammaSummary(tickerMetadata[ticker]?.value || ticker).then((result) => {
                if (result.errorCode === 'INVALID_TICKER') {
                    throw new Error('Invalid ticker.');
                }

                if (result) {
                    return {
                        gammaSummaryData: result,
                    };
                } else {
                    throw new Error('Server error, please try again later.');
                }
            }),
        {
            cacheTime: 1000 * 60, // 60 seconds
            staleTime: 1000 * 60, // 60 seconds
            refetchInterval: 1000 * 60, // 60 seconds
            keepPreviousData: true,
            retry: false,
        },
    );
    const { gammaSummaryData } = queryData || { gammaSummaryData: [] };

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
            <StatusOverlay error={error} loading={loading || !gammaSummaryData} />
            <Grid2
                container
                maxWidth={'100%'}
                padding={'8px'}
                sx={{ overflowY: 'auto' }}
            >
                    <SummaryItem title={'SPOT'} ticker={ticker} data={Math.round(gammaSummaryData.spotPrice * 100) / 100} />
                    <SummaryItem title={'NET GAMMA'} ticker={ticker} data={Math.round(gammaSummaryData.gammaSum * 100) / 100 + 'B'} />
                    <SummaryItem title={'AREA OF INTEREST'} ticker={ticker} data={gammaSummaryData.AOI} />
                    <SummaryItem title={'PRICE MAGNET (beta)'} ticker={ticker} data={generatePriceTarget(ticker, gammaSummaryData.AOI, gammaSummaryData.spotPrice)} />
            </Grid2>
        </div>
    );
}
