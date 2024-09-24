import React from 'react';
import { Badge, Icon, IconButton, Tooltip } from '@mui/material';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import { ReactComponent as LockDashboardIcon } from '../assets/dashboard_lock.svg';
import { isNewModule } from '../util/localStorageUtils';

export const LockDashboard = ({ editMode, onClick }) => {
    // Tooltip key is set to editMode to force re-render on click, otherwise it sometimes gets stuck open
    return (
        <IconButton onClick={onClick} sx={{ color: '#fff' }}>
            <Tooltip key={editMode} title={editMode ? 'Lock Dashboard' : 'Edit Dashboard'} arrow>
                {editMode ? (
                    <Icon>
                        <LockDashboardIcon fill={'#fff'} />
                    </Icon>
                ) : (
                    <Badge color={'warning'} variant={'dot'} invisible={!isNewModule()}>
                        <DashboardCustomizeIcon />
                    </Badge>
                )}
            </Tooltip>
        </IconButton>
    );
};
