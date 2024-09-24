import React, { useContext, useEffect, useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { IconButton, Skeleton, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ErrorBoundary } from '../infrastructure/ErrorBoundary';
import { GlobalToolbarContext } from '../context/GlobalToolbarContext';
import { DashboardLayout } from './DashboardLayout';
import { LockDashboard } from './LockDashboard';
import { getAllItems, getInitialItems, getInitialLayout } from './dashboardItems';
import { DashboardItemProvider } from '../context/DashboardItemContext';
import { DashboardItemToolbar } from './DashboardItemToolbar';
import { ITEMS_STORAGE_KEY, LAYOUT_STORAGE_KEY } from '../util/localStorageUtils';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useQueryClient } from 'react-query';
import { SharedDashboardProvider } from '../context/SharedDashboardContext';
import { objectMap } from '../util/utils';
import { DashboardItemContainer } from './DashboardItemContainer';
import { logToServer } from '../api/apexApi';
import { localStore } from '../util/storageFactory';
import { GlobalAuthSwitcher } from '../infrastructure/GlobalAuthSwitcher';

const ResponsiveGridLayout = WidthProvider(Responsive);

// When we serialize the items to local storage only the id is stored, so reload the other props from the template
const reloadStorageComponentRefs = (items) => {
    if (!items) {
        return items;
    }

    return items.map((item) => {
        const templateItem = getAllItems().filter((template) => item.id.startsWith(template.id))[0];
        return {
            ...templateItem,
            id: item.id,
        };
    });
};

export const Dashboard = () => {
    const queryClient = useQueryClient();

    const [layouts, setLayouts] = useState(
        JSON.parse(localStore.getItem(LAYOUT_STORAGE_KEY)) || getInitialLayout(),
    );

    const saveLayouts = (_, allLayouts) => {
        localStore.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(allLayouts));

        //update current layout state
        setLayouts(allLayouts);
    };

    const loadLayout = (layoutString) => {
        const loadedLayouts = JSON.parse(layoutString);
        localStore.setItem(LAYOUT_STORAGE_KEY, layoutString);
        setLayouts(loadedLayouts);
    };

    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down('sm'));
    const minSize = isXs ? 2 : 4;

    const layoutsWithMinSize = objectMap(layouts, (layoutSize) =>
        layoutSize.map((item) => {
            return {
                ...item,
                w: Math.max(item.w, minSize),
                h: Math.max(item.h, minSize),
                minW: minSize,
                minH: minSize,
                isBounded: true,
            };
        }),
    );

    const [editMode, setEditMode] = useState(false);
    const [items, setItems] = useState(
        reloadStorageComponentRefs(JSON.parse(localStore.getItem(ITEMS_STORAGE_KEY))) ||
            getInitialItems(),
    );
    const saveItems = (items) => {  
        // const itemIds = items.map((item) => {
        //     return {
        //         id: item.id,
        //     };
        // });
        localStore.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));
        //update current items state
        setItems(items);
    };

    const [, dispatch] = useContext(GlobalToolbarContext);
    useEffect(() => {
        const toolbarComponents = [
            {
                component: IconButton,
                props: {
                    key: 'refreshDataButton',
                    onClick: () => {
                        logToServer('info', {message: 'Executing manual refresh'});
                        queryClient.invalidateQueries();
                    },
                },
                children: (
                    <Tooltip title={'Refresh Data'} arrow>
                        <RefreshIcon sx={{ color: '#fff' }} />
                    </Tooltip>
                ),
            },
            {
                component: LockDashboard,
                props: {
                    key: 'lockDashboardButton',
                    editMode: editMode,
                    onClick: () => setEditMode((oldEditMode) => !oldEditMode),
                },
            },
        ];

        if (editMode) {
            toolbarComponents.push({
                component: DashboardLayout,
                props: {
                    key: 'dashboardSettings',
                    initialItems: items,
                    setItems: saveItems,
                    loadLayout: loadLayout,
                },
            });
        }

        dispatch({
            type: 'setToolbarComponents',
            toolbarComponents: toolbarComponents,
        });
        return () => dispatch({ type: 'setToolbarComponents', toolbarComponents: [] });
    }, [queryClient, dispatch, editMode, items]);

    return (
        <GlobalAuthSwitcher>
            <SharedDashboardProvider>
                <ResponsiveGridLayout
                    autoSize={false}
                    layouts={layoutsWithMinSize}
                    rowHeight={60}
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                    cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                    style={{
                        flexGrow: '1',
                        height: '100%',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                    }}
                    onLayoutChange={saveLayouts}
                    isDraggable={editMode}
                    isResizable={editMode}
                    resizeHandles={['se']}
                >
                    {items.map((item) => {
                        return (
                            <div key={item.id}>
                                <ErrorBoundary
                                    key={item.id}
                                    fallback={
                                        <DashboardItemContainer
                                            key={item.id}
                                            toolbar={
                                                <Skeleton
                                                    variant={'rectangular'}
                                                    sx={{
                                                        margin: '10px 15px 5px 15px',
                                                        height: '41px',
                                                        borderRadius: '10px',
                                                        flexGrow: 1,
                                                        backgroundColor: 'grey.900',
                                                    }}
                                                />
                                            }
                                            body={
                                                <>
                                                    <Skeleton
                                                        variant={'rectangular'}
                                                        sx={{
                                                            display: 'block',
                                                            position: 'absolute',
                                                            height: 'auto',
                                                            bottom: 0,
                                                            top: 0,
                                                            left: 0,
                                                            right: 0,
                                                            margin: '5px 15px 10px 15px',
                                                            borderRadius: '10px',
                                                            backgroundColor: 'grey.900',
                                                        }}
                                                    />
                                                    <Typography
                                                        variant={'h3'}
                                                        sx={{
                                                            display: 'flex',
                                                            position: 'absolute',
                                                            alignItems: 'center',
                                                            textAlign: 'center',
                                                            left: '0',
                                                            width: '100%',
                                                            height: '100%',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        Failed to load {item.title}. Please try
                                                        again later
                                                    </Typography>
                                                </>
                                            }
                                        />
                                    }
                                >
                                    <DashboardItemProvider item={item}>
                                        <DashboardItemContainer
                                            key={item.id}
                                            toolbar={<DashboardItemToolbar item={item} />}
                                            body={
                                                <item.component
                                                    id={item.id}
                                                    {...item.dashboardProps}
                                                />
                                            }
                                        />
                                    </DashboardItemProvider>
                                </ErrorBoundary>
                            </div>
                        );
                    })}
                </ResponsiveGridLayout>
            </SharedDashboardProvider>
        </GlobalAuthSwitcher>
    );
};
