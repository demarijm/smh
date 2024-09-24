import {
    DONE_TUTORIAL_STORAGE_KEY,
    REPLAY_TUTORIAL_STORAGE_KEY,
    useLocalStorageListener,
} from './util/localStorageUtils';
import {
    alpha,
    Button,
    Checkbox,
    darken,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    ListItem,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import Carousel from './carousel';
import { ReactComponent as DiscordIcon } from './assets/discord.svg';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';

export const WelcomeDialog = () => {
    const [index, setIndex] = useState(0);
    const [localOpen, setLocalOpen] = useState(true);
    const [checked, setChecked] = useState(false);
    const { value: isDoneTutorial, setValue: setDoneTutorial } = useLocalStorageListener({
        key: DONE_TUTORIAL_STORAGE_KEY,
    });
    const { value: isReplayTutorial, setValue: setReplayTutorial } = useLocalStorageListener({
        key: REPLAY_TUTORIAL_STORAGE_KEY,
    });

    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down('sm'));

    const handleDialogClose = (event, reason) => {
        if (reason === 'backdropClick') {
            return;
        }

        if (checked) {
            setDoneTutorial('true');
        }
        setReplayTutorial(undefined);
        setLocalOpen(false);
    };

    useEffect(() => {
        if (isReplayTutorial) {
            setIndex(0);
            setLocalOpen(true);
        }
    }, [isReplayTutorial]);

    const dialogPages = [
        <ListItem key={'intro'}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img
                    src={
                        'https://traderlink.io/wp-content/uploads/2023/11/cropped-traderlink_logo_final-03.png'
                    }
                    alt={'Traderlink Logo'}
                    width={100}
                    height={100}
                />
                <Typography variant={'body1'} align={'center'}>
                    Thank you for joining the Traderlink community! Here are some of the basics to
                    help you get the most out of Traderlink.
                </Typography>
                <br />
                <Typography variant={'body2'} align={'center'}>
                    Your receipt and use of this service is subject to the terms and conditions of
                    your agreement with Traderlink LLC. To view the terms and conditions of this
                    agreement, please{' '}
                    <a
                        href={'https://traderlink.io/account/?action=documents'}
                        target={'_blank'}
                        rel={'noreferrer'}
                        style={{ color: theme.palette.primary.main }}
                    >
                        click here
                    </a>
                    .
                </Typography>
            </div>
        </ListItem>,
        <ListItem key={'tutorial1'}>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                }}
            >
                <Typography variant={'body1'} align={'center'}>
                    Traderlink is fully modular and can be customized to fit your trading style.
                </Typography>
                <Typography variant={'body1'} align={'center'}>
                    Begin by unlocking the layout to enable edit mode. Then click 'Edit Dashboard
                    Components' to add or remove modules.
                </Typography>
                <img
                    src={'https://traderlink.io/wp-content/uploads/2023/11/tutorial_edit.gif'}
                    style={{ borderRadius: 10, maxWidth: '100%' }}
                    alt={'Unlock the dashboard'}
                />
            </div>
        </ListItem>,
        <ListItem key={'tutorial2'}>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                }}
            >
                <Typography variant={'body1'} align={'center'}>
                    Click the bottom corner to resize the module. Then click and drag anywhere on
                    the module to reposition it.
                </Typography>
                <img
                    src={'https://traderlink.io/wp-content/uploads/2023/11/tutorial_resize.gif'}
                    style={{ borderRadius: 10, maxWidth: '100%' }}
                    alt={'Resize modules'}
                />
            </div>
        </ListItem>,
        <ListItem key={'conclusion'}>
            <div
                style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}
            >
                <Typography variant={'body1'} align={'center'}>
                    Join our Discord for service updates, feedback, and market discussion.
                </Typography>
                <Button
                    href={'https://discord.gg/apexdashboard'}
                    target={'_blank'}
                    rel={'noreferrer'}
                    size={'medium'}
                    sx={{
                        alignSelf: 'center',
                        width: 160,
                        backgroundColor: '#5865F2',
                        '&:hover': { backgroundColor: darken('#5865F2', 0.2) },
                    }}
                >
                    <DiscordIcon
                        style={{
                            paddingTop: 4,
                            paddingBottom: 4,
                            paddingLeft: 10,
                            paddingRight: 10,
                            height: 30,
                        }}
                    />
                </Button>
                <br />
                <Typography variant={'body1'} align={'center'}>
                    Then link your Traderlink account to Discord to gain access to our exclusive
                    members chat, historical data, and more!
                </Typography>
                <Button
                    startIcon={<ArrowOutwardIcon />}
                    size={'medium'}
                    href={'https://traderlink.io/account'}
                    target={'_blank'}
                    rel={'noreferrer'}
                    sx={{ alignSelf: 'center', width: 160, height: 50 }}
                    variant={'outlined'}
                >
                    My Account
                </Button>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={checked}
                            onChange={(event) => setChecked(event.target.checked)}
                        />
                    }
                    label={"I have read and understood. Don't show this again"}
                />
            </div>
        </ListItem>,
    ];

    const renderDialogActions = () => {
        const buttons = [];

        if (index > 0) {
            buttons.push(
                <Button
                    key={'previous'}
                    variant={'outlined'}
                    onClick={() => setIndex((oldI) => oldI - 1)}
                    sx={{
                        color: theme.palette.error.main,
                        borderColor: alpha(theme.palette.error.main, 0.5),
                        '&:hover': {
                            borderColor: theme.palette.error.main,
                            backgroundColor: alpha(theme.palette.error.main, 0.04),
                        },
                    }}
                >
                    Previous
                </Button>,
            );
        }

        const isLast = index === dialogPages.length - 1;
        buttons.push(
            <Button
                key={'next'}
                variant={'outlined'}
                onClick={() => (isLast ? handleDialogClose() : setIndex((oldI) => oldI + 1))}
                sx={{
                    color: theme.palette.success.main,
                    borderColor: alpha(theme.palette.success.main, 0.5),
                    '&:hover': {
                        borderColor: theme.palette.success.main,
                        backgroundColor: alpha(theme.palette.success.main, 0.04),
                    },
                }}
            >
                {isLast ? 'Get Started' : 'Next'}
            </Button>,
        );
        return buttons;
    };

    /*
     * This logic is a bit complicated, because there are three scenarios to show the dialog
     * 1. The user has first opened the dashboard
     * 2. The user has returned to the dashboard, and has not clicked the 'do not show again' button
     * 3. The user has clicked the 'show tutorial' button in the help menu
     */
    const dialogOpen = (!isDoneTutorial && localOpen) || isReplayTutorial;
    return (
        dialogOpen && (
            <>
                <Dialog
                    fullScreen={isXs}
                    fullWidth
                    open={dialogOpen}
                    onClose={handleDialogClose}
                    PaperProps={{
                        sx: { backgroundColor: 'rgba(30,30,30,1)' },
                    }}
                >
                    <DialogTitle sx={{ fontWeight: '600' }}>Welcome to Traderlink</DialogTitle>
                    <DialogContent sx={{ overflowX: 'hidden' }}>
                        <Carousel
                            index={index}
                            autoPlay={false}
                            swipe={false}
                            animation={'slide'}
                            indicators={false}
                            navButtonsAlwaysInvisible={true}
                        >
                            {dialogPages}
                        </Carousel>
                    </DialogContent>
                    <DialogActions>{renderDialogActions()}</DialogActions>
                </Dialog>
            </>
        )
    );
};
