import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Drawer,
    IconButton,
    List,
    ListItem,
    Slide,
    ToggleButton,
    ToggleButtonGroup,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { LINK_CHANNELS } from '../context/SharedDashboardContext';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import LinkIcon from '@mui/icons-material/Link';
import React, { useContext, useState } from 'react';
import { DashboardItemContext } from '../context/DashboardItemContext';
import SettingsIcon from '@mui/icons-material/Settings';

export const DashboardItemToolbarSettings = ({ item, containerRef }) => {
    const [state, dispatch] = useContext(DashboardItemContext);
    const [menuOpen, setMenuOpen] = useState(false);

    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down('sm'));

    const linkValue = state.linkChannel || LINK_CHANNELS.UNLINKED.value;

    const dispatchDisplayMode = (value) => {
        dispatch({ type: 'setDisplayMode', displayMode: value });
    };

    const renderSettingsContainer = (settings) => {
        if (isXs) {
            return (
                <Dialog
                    open={menuOpen}
                    onClose={() => setMenuOpen(false)}
                    fullScreen
                    TransitionComponent={Slide}
                    TransitionProps={{ direction: 'up' }}
                >
                    <DialogTitle>{item.title} Settings</DialogTitle>
                    <DialogContent>{settings}</DialogContent>
                    <DialogActions>
                        <Button onClick={() => setMenuOpen(false)}>Close</Button>
                    </DialogActions>
                </Dialog>
            );
        }

        return (
            <Drawer
                anchor={'right'}
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                ModalProps={{
                    container: containerRef.current,
                    disableAutoFocus: true,
                    slotProps: {
                        backdrop: {
                            sx: {
                                overflow: 'hidden',
                                borderTopRightRadius: '10px',
                                borderBottomRightRadius: '10px',
                            },
                        },
                    },
                    sx: {
                        clipPath: 'inset(0px 0px 0px 0px round 10px)',
                        overflow: 'hidden',
                        borderTopRightRadius: '10px',
                        borderBottomRightRadius: '10px',
                    },
                }}
                SlideProps={{ direction: 'left', container: containerRef.current }}
                PaperProps={{
                    sx: {
                        borderLeft: 'unset',
                        borderTopRightRadius: '10px',
                        borderBottomRightRadius: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                    },
                }}
            >
                {settings}
            </Drawer>
        );
    };

    return (
        <>
            <IconButton onClick={() => setMenuOpen(true)}>
                <SettingsIcon
                    sx={{
                        color: `${
                            Object.values(LINK_CHANNELS)
                                .filter((channel) => channel.value === linkValue)
                                .map(({ color }) => color)[0]
                        }`,
                    }}
                />
            </IconButton>
            {renderSettingsContainer(
                <List sx={{ paddingTop: '5px !important' }}>
                    <ListItem key={'linkChannel'}>
                        <ToggleButtonGroup
                            exclusive={true}
                            fullWidth
                            size={'small'}
                            value={linkValue}
                            onChange={(_, value) =>
                                dispatch({ type: 'setLinked', linkChannel: Math.max(0, value) })
                            }
                            sx={{
                                maxHeight: '31px',
                                alignSelf: 'center',
                            }}
                        >
                            <ToggleButton value={LINK_CHANNELS.UNLINKED.value}>
                                <LinkOffIcon />
                            </ToggleButton>
                            <ToggleButton value={LINK_CHANNELS.R.value}>
                                <LinkIcon sx={{ color: LINK_CHANNELS.R.color }} />
                            </ToggleButton>
                            <ToggleButton value={LINK_CHANNELS.G.value}>
                                <LinkIcon sx={{ color: LINK_CHANNELS.G.color }} />
                            </ToggleButton>
                            <ToggleButton value={LINK_CHANNELS.B.value}>
                                <LinkIcon sx={{ color: LINK_CHANNELS.B.color }} />
                            </ToggleButton>
                            <ToggleButton value={LINK_CHANNELS.Y.value}>
                                <LinkIcon sx={{ color: LINK_CHANNELS.Y.color }} />
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </ListItem>
                    {state.customActions.map((action) => (
                        <ListItem key={action.component}>
                            <action.component {...action.props} />
                        </ListItem>
                    ))}
                    {item?.dashboardProps?.showSplitNet && (
                        <ListItem key={'splitNet'}>
                            <ToggleButtonGroup
                                orientation={'horizontal'}
                                value={state?.displayMode}
                                exclusive
                                fullWidth
                                onChange={(event, value) => value && dispatchDisplayMode(value)}
                                sx={{
                                    maxHeight: '31px',
                                    alignSelf: 'center',
                                }}
                            >
                                <ToggleButton fullWidth value={'net'}>
                                    Net
                                </ToggleButton>
                                <ToggleButton fullWidth value={'split'}>
                                    Split
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </ListItem>
                    )}
                </List>,
            )}
        </>
    );
};
