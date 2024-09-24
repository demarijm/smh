import React, { useEffect } from 'react';
import Modal from '@mui/material/Modal';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import HistoricalFlow from './HistoricalFlow';
import HistoricalChart from './HistoricalChart';
import { useQuery, useQueryClient } from 'react-query';
import { getHistoricalUnusualOptions } from '../../../api/apexApi';
import { getContractData } from './logic';
import { convertNumberToDollar } from '../logic';
import ModalTital from './modalTitle';
import ContractStat from './contractDailyStats';

const style = {
    display: 'flex',
    flexDirection: 'column',
    width: '90%',
    height: '90%',
    bgcolor: '#1f1f1f',
    overflow: 'scroll',
    boxSizing: 'border-box',
};

function BasicModal({ modalOpen, updateModalOpen, selectedTicker, selectedContract, updateSelectedContract }) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!modalOpen) {
            updateSelectedContract(null);
            queryClient.invalidateQueries(['historicalOptionsData']);
        }
    }, [modalOpen, queryClient, updateSelectedContract]);

    const { data: queryData } = useQuery(
        [selectedContract, 'historicalOptionsData'],
        () =>
            getHistoricalUnusualOptions(selectedTicker, selectedContract).then((result) => {
                console.log(result)
                if (selectedContract === null) {
                    return;
                }
                if (!result) {
                    throw new Error('Server error, please try again later.');
                }
                return getContractData(result);
            }),
        {
            cacheTime: 1000 * 60, // 60 seconds
            staleTime: 1000 * 60, // 60 seconds
            refetchInterval: 1000 * 60, // 60 seconds
            keepPreviousData: true,
            retry: false,
        },
    );
    const { contractData, dailyContractData, multilegData, historicalData } = queryData || {};

    if (modalOpen && contractData) {
        return (
            <div>
                <Modal
                    open={modalOpen}
                    onClose={() => updateModalOpen(false)}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                    sx={{
                        display: 'flex',
                        width: '100%',
                        height: '100%',
                        alignItems: 'center',  
                        justifyContent: 'center',
                    }}
                >
                    <Box sx={style}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '15px',
                                backgroundColor: '#1f1f1f',
                                width: '100%',
                                boxSizing: 'border-box',
                            }}
                        >
                            <ModalTital>
                                {contractData[0].contractTicker}{' '} 
                                {contractData[0].contractStrike}{' '}
                                {contractData[0].contractType} |{' '}
                                {contractData[0].contractExipration}
                            </ModalTital>
                            <CloseIcon
                                onClick={() => updateModalOpen(false)}
                                sx={{
                                    '&:hover': {
                                        cursor: 'pointer',
                                    },
                                }}
                            />
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                padding: '15px',
                                backgroundColor: '#1f1f1f',
                                width: '100%',
                                boxSizing: 'border-box',
                            }}
                        >
                            <ContractStat stat="Total Premium" value={convertNumberToDollar(dailyContractData.totalDailyPremium)} />
                            <ContractStat stat="Average Price" value={(dailyContractData.vwap).toFixed(2)} />
                            <ContractStat stat="Volume" value={dailyContractData.volume.toLocaleString()} />
                            <ContractStat stat="Open Interest" value={dailyContractData.OI.toLocaleString()} />

                        </div>
                        <HistoricalChart historicalData={historicalData} />
                        <HistoricalFlow title={'Historical Flow'} contractData={contractData} />
                        {multilegData === false || multilegData === undefined ? null : (
                            <HistoricalFlow title={'Multileg Flow'} contractData={multilegData} />
                        )}
                    </Box>
                </Modal>
            </div>
        );
    } else {
        return null;
    }
}

export default React.memo(BasicModal);
