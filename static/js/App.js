import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Box, ScopedCssBaseline, ThemeProvider, Typography } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { themeOptions } from './theme';
import './styles/appContainer.css';
import { Dashboard } from './dashboard/Dashboard';
import { GlobalToolbar } from './GlobalToolbar';
import { GlobalToolbarProvider } from './context/GlobalToolbarContext';
import { ErrorBoundary } from './infrastructure/ErrorBoundary';
import FailedToLoadPage from './infrastructure/FailedToLoadPage';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { LicenseInfo } from '@mui/x-data-grid-pro';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { WelcomeDialog } from './WelcomeDialog';
import {
    BarController,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineController,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import zoomPlugin from './plugin/zoomPlugin';
import watermarkPlugin from './plugin/watermarkPlugin';
import borderPlugin from './plugin/borderPlugin';
import ChartDataLabels from 'chartjs-plugin-datalabels';

/* Libraries initialization */
LicenseInfo.setLicenseKey(
    '58ce82d056399c8f4a244f89f79a8fa0Tz05NDk1OCxFPTE3NTM1NTI2OTUwMDAsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI=',
);

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarController,
    BarElement,
    LineController,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    annotationPlugin,
    zoomPlugin,
    watermarkPlugin,
    borderPlugin,
    ChartDataLabels,
);

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchIntervalInBackground: true,
        },
    },
});

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/New_York');

function App() {
    const renderTopLevelError = () => {
        return (
            <div>
                <Typography variant={'h4'}>
                    Something went wrong!
                    <br />
                    Please contact us for support.
                </Typography>
                <Typography variant={'h5'}>{dayjs.tz().format('YYYY-MM-DD hh:mm:ss')}</Typography>
            </div>
        );
    };

    return (
        <ErrorBoundary fallback={<FailedToLoadPage message={renderTopLevelError()} />}>
            <ScopedCssBaseline enableColorScheme>
                <QueryClientProvider client={queryClient}>
                    <ThemeProvider theme={createTheme(themeOptions)}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <GlobalToolbarProvider>
                                <Box
                                    component={'div'}
                                    sx={{
                                        height: '100vh',
                                        background: '#000',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <GlobalToolbar />
                                    <Box
                                        sx={{
                                            width: '100%',
                                            maxWidth: '100%',
                                            paddingBottom: '20px',
                                            boxSizing: 'border-box',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            flexGrow: '1',
                                            background: '#000',
                                            backgroundRepeat:
                                                'no-repeat, no-repeat, no-repeat, no-repeat',
                                            backgroundPositionY: '0px, 1390px, 0px, 1390px',
                                            backgroundPositionX: '0px, 0px, 2560px, 2560px',
                                        }}
                                    >
                                        <ErrorBoundary fallback={<FailedToLoadPage />}>
                                            <Dashboard key={'Dashboard'} />
                                        </ErrorBoundary>
                                    </Box>
                                    <Typography
                                        variant={'caption'}
                                        sx={{
                                            position: 'absolute',
                                            bottom: '0px',
                                            left: '50%',
                                            transform: 'translate(-50%, 0%)',
                                            color: 'rgba(255, 255, 255, 0.5)',
                                        }}
                                    >
                                        © Traderlink LLC {dayjs.tz().format('YYYY')}
                                    </Typography>
                                    <WelcomeDialog />
                                </Box>
                            </GlobalToolbarProvider>
                        </LocalizationProvider>
                    </ThemeProvider>
                </QueryClientProvider>
            </ScopedCssBaseline>
        </ErrorBoundary>
    );
}

export default App;
