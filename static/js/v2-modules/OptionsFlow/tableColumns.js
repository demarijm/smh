import { convertUnixTimestamp, convertUnixTimestampWithDay, numberComparator} from './logic';
import AdjustIcon from '@mui/icons-material/Adjust';
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { getGridNumericOperators } from '@mui/x-data-grid-pro';
import dayjs from 'dayjs';


export const generateTableColumns = () => {
        const optionsColumns = [
            {
                field: 'nanoTimestamp',
                headerName: 'Time',
                sortable: true,
                filterable: false,
                renderCell: (params) => `${convertUnixTimestampWithDay(params.value)} ${convertUnixTimestamp(params.value)}`,
            },
            { field: 'contractTicker', headerName: 'Ticker', sortable: true, filterable: true, type:'string' },
            {
                field: 'currentTickerMark',
                headerName: 'Mark',
                sortable: true,
                filterable: true,
                type: 'number',
                valueFormatter: ({ value }) => Number(value).toFixed(2),
            },
            {
                field: 'label',
                headerName: 'Block/Sweep',
                sortable: false,
                filterable: false,
                renderCell: (params) => {
                    if(params.row.label === 'SWEEP'){
                        return <p style={{color: 'rgb(142, 68, 173)'}}>SWEEP</p>
                    }else if(params.row.label === 'NONLABELEDSWEEP'){
                        return <p style={{color: 'rgb(142, 68, 173)'}}>SPLIT</p>
                    }else{
                        return <p>BLOCK</p>
                    }
                }
            },
            { field: 'contractStrike', headerName: 'Strike', sortable: true, filterable: true, type:'number' },
            {
                field: 'contractType',
                headerName: 'C/P',
                sortable: false,
                filterable: true,
                renderCell: (params) => (
                    <div className={params.value === 'CALL' ? 'bBG' : 'sBG'}>{params.value}</div>
                ),
            },
            {
                field: 'contractExipration',
                headerName: 'Expo',
                sortable: true,
                filterable: true,
                type: 'date',
                valueFormatter: ({ value }) => dayjs(value).format('MM/DD/YYYY'),
            },
            {
                field: 'contractDaysTillExpo',
                headerName: 'DTE',
                sortable: true,
                filterable: true,
                type: 'number',
                renderCell: (params) => `${params.value}d`,
            },
            {
                field: 'bidAsk',
                headerName: 'Bid/Ask',
                sortable: false,
                filterable: true,
                type: 'string',
                renderCell: (params) => `${params.row.contractBid} - ${params.row.contractAsk}`,
            },
            {
                field: 'contractPrice',
                headerName: 'Fill',
                sortable: false,
                filterable: true,
                type: 'number',
                sortComparator: numberComparator,
            },
           
            {
                field: 'tradeSize',
                headerName: 'Size',
                sortable: false,
                filterable: true,
                type: 'number',
                filterOperators: getGridNumericOperators().filter(
                    (operator) => operator.value === '>' || operator.value === '<',
                ),
            },
            {
                field: 'totalTradeValue',
                headerName: 'Value',
                sortable: true,
                filterable: true,
                type: 'number',
                valueGetter: ({ value }) => Number(value.replace(/[^0-9.-]+/g, '')),
                renderCell: (params) => '$' + Math.round(params.value / 1000) + 'K',
                sortComparator: numberComparator,
            },
            { 
                field: 'intent', 
                headerName: 'Sentiment', 
                sortable: true, 
                filterable: true,
                renderCell: (params) => {
                    if(params.value.includes('ask')) {
                        return 'ASK'
                    }else if(params.value.includes('bid')) {
                        return 'BID'
                    }else{
                        return 'MARK'
                    }
                }
            },
            { 
                field: 'openingTrade', 
                headerName: 'New Position', 
                sortable: true, 
                filterable: true,
                renderCell: (params) => {
                    if(params.value !== null){
                        return params.value
                    }else{
                        return 'N/A'
                    }
                }
            },
            { 
                field: 'bull/bear', 
                headerName: 'BULL/BEAR', 
                sortable: true, 
                filterable: true,
                renderCell: (params) => {
                    if(params.row.openingTrade !== null){
                        if(params.row.openingTrade.includes('BTO') && params.row.contractType.includes('CALL')){
                            return 'BULL'
                        }else if(params.row.openingTrade.includes('STO') && params.row.contractType.includes('CALL')){
                            return 'BEAR'
                        }else if(params.row.openingTrade.includes('BTO') && params.row.contractType.includes('PUT')){
                            return 'BEAR'
                        }else if(params.row.openingTrade.includes('STO') && params.row.contractType.includes('PUT')){
                            return 'BULL'
                        }
                    }else{
                        return 'N/A'
                    }
                }
            },
            {
                field: 'oi',
                headerName: 'OI',
                sortable: false,
                filterable: true,
                type: 'boolean',
                    renderCell: (params) => {
                        if(params.row.oi == null){
                            return `N/A`;
                        }else{
                            return `${params.row.oi.toLocaleString()}`
                        }
                    },
                },
            {
                field: 'impliedVol',
                headerName: 'IV',
                sortable: false,
                filterable: true,
                type: 'boolean',
                renderCell: (params) => {
                    if(params.row.impliedVol === null){
                    return `N/A`;
                    }else{
                        return `${(params.row.impliedVol * 100).toFixed(2)}%`
                    }
                },
            },
            {
                field: 'volGreaterThanOI',
                headerName: 'VOL>OI',
                sortable: false,
                filterable: true,
                type: 'boolean',
                renderCell: (params) => (
                    <AdjustIcon fontSize={'small'} className={params.value === true ? 'blue' : 'null'} />
                ),
            },
            {
                field: 'contractOTM',
                headerName: 'OTM',
                sortable: false,
                filterable: true,
                type: 'boolean',
                renderCell: (params) => (
                    <AdjustIcon fontSize={'small'} className={params.value === true ? 'purple' : 'null'} />
                ),
            },
            {
                field: 'isMultiLeg',
                headerName: 'Multileg',
                sortable: false,
                filterable: true,
                type: 'boolean',
                renderCell: (params) => (
                    <AdjustIcon fontSize={'small'} className={params.value === true ? 'yellow' : 'null'} />
                ),
            },
            {
                field: 'moreInfo',
                headerName: '',
                sortable: false,
                filterable: false,
                renderCell: (params) => {
                    if(params.row.isCached === true){
                        return <ReadMoreIcon fontSize={'small'} style={{cursor: 'pointer'}} />
                    }else{
                        return <AccessTimeIcon fontSize={'small'} style={{opacity: '0.2'}} />
                    }
                }
            },
            { field: 'highlight', headerName: 'highlight', type:'boolean', },
        ];
        return optionsColumns;
    }

    export const tableStyles = () => {
        return {
            backgroundColor: 'rgba(255, 255, 255, 0.0)',
            width: '100%',
            '& .buy': {
                color: '#4acf81 !important',
            },
            '& .sell': {
                color: '#e63262 !important',
            },
            '& .bBG': {
                background: '#4acf81',
                padding: '5px',
                borderRadius: '5px',
                width: '50px',
                textAlign: 'center',
                color: '#fff',
            },
            '& .sBG': {
                background: '#e63262',
                padding: '5px',
                borderRadius: '5px',
                width: '50px',
                textAlign: 'center',
                color: '#fff',
            },
            '& .null': {
                color: '#fff !important',
                opacity: '0.1',
            },
            '& .highlight': {
                backgroundImage:
                    'radial-gradient(circle, rgba(142, 68, 173, .4), rgba(0, 0, 0, .00)) !important',
                borderTop: `1px solid rgba(142, 68, 173, .9)`,
                borderBottom: '1px solid rgba(255,255,255,0.1)',
            },
            '& .basic': {
                borderBottom: '1px solid rgba(255,255,255,0.1)',
            },
            '& .date': {
                fontSize: '12px',
                opacity: '0.6',
            },
            '& .value': {
                fontSize: '16px',
            },
            '& .plain': {
                textTransform: 'uppercase',
                fontSize: '12px',
            },
            '& .blue': {
                color: '#56EEF4 !important',
            },
            '& .purple': {
                color: '#8e44ad !important',
            },
            '& .yellow': {
                color: '#FFC933 !important',
            },
            marginTop: '10px',
            position: 'relative',
        }
    }