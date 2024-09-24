import React, { useContext, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import Grid2 from '@mui/material/Unstable_Grid2';
import { StatusOverlay } from '../../infrastructure/StatusOverlay';
import { DashboardItemContext } from '../../context/DashboardItemContext';
import { useQuery } from 'react-query';
import { DataGridPro } from '@mui/x-data-grid-pro';
import * as optionsFlowLogic from './logic';
import { generateTableColumns, tableStyles } from './tableColumns';
import { datagridStyles } from '../DatagridStyles/datagridStyles';
import { DateSelector } from '../../infrastructure/DateSelector';
import { TransitionGroup } from 'react-transition-group';
import { AnimatedGridRow } from '../../infrastructure/AnimatedGridRow';
import LinearHeader from './header/LinearHeader';
import { getUnusualOptions, INVALID_TICKER_MSG } from '../../api/apexApi';
import Modal from './modal/Modal';

const createFilterModelStore = () => {
    let listeners = [];
    const lsKey = 'tl-filter-model';
    const emptyModel = 'null';
  
    return {
      subscribe: (callback) => {
        listeners.push(callback);
        return () => {
          listeners = listeners.filter((listener) => listener !== callback);
        };
      },
      getSnapshot: () => {
        try {
          return localStorage.getItem(lsKey) || emptyModel;
        } catch (error) {
          return emptyModel;
        }
      },
      getServerSnapshot: () => {
        return emptyModel;
      },
      update: (filterModel) => {
        localStorage.setItem(lsKey, JSON.stringify(filterModel));
        listeners.forEach((listener) => listener());
      },
    };
  };

  const usePersistedFilterModel = () => {
    const [filterModelStore] = React.useState(createFilterModelStore);
  
    const filterModelString = React.useSyncExternalStore(
      filterModelStore.subscribe,
      filterModelStore.getSnapshot,
      filterModelStore.getServerSnapshot,
    );
  
    const filterModel = React.useMemo(() => {
      try {
        return JSON.parse(filterModelString) || undefined;
      } catch (error) {
        return undefined;
      }
    }, [filterModelString]);
  
    return React.useMemo(
      () => [filterModel, filterModelStore.update],
      [filterModel, filterModelStore.update],
    );
  };
  


export default function UnusualOptions() {
    const [filterModel, setFilterModel] = usePersistedFilterModel();
    const dashboardItemContext = useContext(DashboardItemContext);
    const [dashboardItemState, dashboardItemDispatch] = Array.isArray(dashboardItemContext)
        ? dashboardItemContext
        : [];
    const ticker = dashboardItemState?.ticker || 'SPY';
    const selectedDateStr = (dashboardItemState?.selectedDate || dayjs.tz()).format('YYYY/MM/DD');
    const [modalOpen, updateModalOpen] = useState(false);
    const [selectedContract, updateSelectedContract] = useState(null);
    const [selectedTicker, updateSelectedTicker] = useState(null);

    const onFilterModelChange = React.useCallback(
        (newFilterModel) => {
          setFilterModel(newFilterModel);
        },
        [setFilterModel],
      );

    function handleContractClick(params) {
        if (params.field === 'moreInfo' && params.row.isCached === true) {
            updateSelectedContract(params.row.contractSymbol);
            updateSelectedTicker(params.row.contractTicker);
            updateModalOpen(true);
        }
    }

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
        [ticker, selectedDateStr, 'unusualOptions'],
        () =>
            getUnusualOptions(ticker, selectedDateStr).then((result) => {
                if (!result) {
                    throw new Error('Server error, please try again later.');
                } else if (result === INVALID_TICKER_MSG) {
                    throw new Error('Invalid ticker.');
                }

                if (!Array.isArray(result)) {
                    return undefined;
                }
                return {
                    optionsData: result,
                };
            }),
        {
            cacheTime: 1000 * 60, // 1 minute
            staleTime: 1000 * 60, // 1 minute
            refetchInterval: 1000 * 60, // 1 minute
            keepPreviousData: true,
            retry: false,
        },
    );
    const { optionsData } = queryData || { optionsData: [] };

    const optionsSentiment = useMemo(() => {
        return optionsFlowLogic.generateOptionsSentiment(optionsData);
    }, [optionsData]);

    return (
        <>
            <StatusOverlay loading={loading || !optionsData} error={error} />
            <Grid2 container xs={12} md={12} sx={{ marginTop: '5px', padding: '0 10px' }}>
                <LinearHeader
                    optionsSentiment={{
                        calls: optionsSentiment.calls,
                        callVolume: optionsSentiment.callVolume,
                        callPrice: optionsSentiment.callPrice,
                        puts: optionsSentiment.puts,
                        putVolume: optionsSentiment.putVolume,
                        putPrice: optionsSentiment.putPrice,
                    }}
                />
                {selectedContract !== null ?
                    <Modal
                    modalOpen={modalOpen}
                    updateModalOpen={updateModalOpen}
                    selectedTicker={selectedTicker}
                    selectedContract={selectedContract}
                    updateSelectedContract={updateSelectedContract}
                /> 
                : null}
               

                <Grid2 xs={12} sx={tableStyles()}>
                    <TransitionGroup>
                        <DataGridPro
                            getRowId={(r) => r._id}
                            sx={datagridStyles}
                            rows={optionsData}
                            columns={generateTableColumns()}
                            throttleRowsMs={0}
                            getCellClassName={(params) => {
                                if (params.field === 'timestamp') {
                                    return 'date';
                                } else if (params.field === ('totalTradeValue' || 'tradeSize')) {
                                    return 'value';
                                } else if (params.value === ('above ask' || 'at ask')) {
                                    return 'buy';
                                } else if (params.value === ('under bid' || 'at bid')) {
                                    return 'sell';
                                } else if (params.value === ('over mark' || 'unknown')) {
                                    return 'plain';
                                }
                            }}
                            getRowClassName={(params) => {
                                if (
                                    params.row.highlight === true ||
                                    params.row.highlight === 'true'
                                ) {
                                    return 'highlight';
                                } else {
                                    return 'basic';
                                }
                            }}
                            disableSelectionOnClick
                            hideFooterSelectedRowCount
                            columnVisibilityModel={{
                                highlight: false,
                                contractDaysTillExpo: true,
                            }}
                            slots={{ row: AnimatedGridRow }}
                            slotProps={{
                                panel: {
                                    sx: {
                                        '& .MuiDataGrid-filterFormValueInput': {
                                            alignSelf: 'flex-end',
                                        },
                                    },
                                },
                            }}
                            onCellClick={(params) => handleContractClick(params)}
                            pagination={true}
                            initialState={{
                                pagination: { paginationModel: { pageSize: 25 } },
                                sorting: {
                                    sortModel: [{ field: 'nanoTimestamp', sort: 'desc' }],
                                },
                            }}
                            pageSizeOptions={[25, 50, 100, 1000]}
                            filterModel={filterModel}
                            onFilterModelChange={onFilterModelChange}
                        />
                    </TransitionGroup>
                </Grid2>
            </Grid2>
        </>
    );
}
