import { GlobalToolbarContext } from './context/GlobalToolbarContext';
import {
    AppBar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    // Drawer,
    IconButton,
    // Slide,
    Toolbar,
    Tooltip,
} from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import { savePreset } from './api/apexApi';
import React, { useContext, useRef, useState } from 'react';
// import { GlobalHelpContent } from './help/GlobalHelpContent';
import { localStore } from './util/storageFactory';
import { ITEMS_STORAGE_KEY, LAYOUT_STORAGE_KEY } from './util/localStorageUtils';
import { setReplayTutorial } from './util/localStorageUtils';



// const Transition = React.forwardRef(function Transition(props, ref) {
//     return <Slide direction="up" ref={ref} {...props} />;
// });

export const GlobalToolbar = () => {
    const appBarRef = useRef(undefined);
    // const [helpOpen, setHelpOpen] = useState(false);
    const [saveLayoutOpen, setSaveLayoutOpen] = useState(false);
    const [state] = useContext(GlobalToolbarContext);
    const toolbarComponents = state?.toolbarComponents || [];

    // const width =
    //     window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    // const useDialog = width < 1094;

    const renderLogo = () => {
        const renderButton = (image, imageProps) => {
            return (
                <Button
                    disableRipple
                    disableFocusRipple
                    style={{ backgroundColor: 'transparent' }}
                    href={'https://traderlink.io/'}
                >
                    <img src={image} alt={'Traderlink Home Page'} {...imageProps} />
                </Button>
            );
        };

        return (
            <>
                <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>
                    {renderButton(
                        'https://traderlink.io/wp-content/uploads/2024/09/traderlink_logo_symbol_w.png',
                        { style:  { width: '48px', height: '48px' }},
                    )}
                </Box>
                <Box sx={{ flexGrow: 1, display: { xs: 'block', sm: 'none' } }}>
                    {renderButton(
                        'https://traderlink.io/wp-content/uploads/2024/09/traderlink_logo_symbol_w.png',
                        {
                            style: { width: '48px', height: '48px' },
                        },
                    )}
                </Box>
            </>
        );
    };

    const renderToolbarComponents = () => (
        <>
            {toolbarComponents.map((component) => (
                <component.component {...component.props}>{component.children}</component.component>
            ))}
        </>
    );

    // const renderHelpButton = () => {
    //     return (
    //         <>
    //             <Tooltip
    //                 arrow
    //                 placement={'bottom-end'}
    //                 componentsProps={{
    //                     popper: { sx: { maxWidth: 'unset' } },
    //                     tooltip: { sx: { maxWidth: 'unset' } },
    //                 }}
    //                 sx={{ display: { xs: 'none', sm: 'none', md: 'block', color: '#fff' } }}
    //                 title={'Help'}
    //             >
    //                 <IconButton
    //                     onClick={() => setHelpOpen((open) => !open)}
    //                     sx={{ height: '40px', color: '#fff' }}
    //                 >
    //                     <HelpIcon />
    //                 </IconButton>
    //             </Tooltip>
    //             <Drawer
    //                 open={helpOpen && !useDialog}
    //                 onClose={() => setHelpOpen(false)}
    //                 anchor={'right'}
    //                 ModalProps={{ container: appBarRef.current, keepMounted: true }}
    //                 SlideProps={{ direction: 'left', container: appBarRef.current }}
    //                 PaperProps={{
    //                     sx: {
    //                         backgroundColor: 'rgba(30, 30, 30, 0.5)',
    //                         borderLeft: 'unset',
    //                         display: 'flex',
    //                         flexDirection: 'column',
    //                     },
    //                 }}
    //             >
    //                 <GlobalHelpContent setHelpOpen={setHelpOpen} />
    //             </Drawer>
    //             <Dialog
    //                 fullScreen
    //                 open={helpOpen && useDialog}
    //                 onClose={() => setHelpOpen(false)}
    //                 TransitionComponent={Transition}
    //             >
    //                 <DialogContent>
    //                     <GlobalHelpContent setHelpOpen={setHelpOpen} />
    //                 </DialogContent>
    //                 <DialogActions>
    //                     <Button onClick={() => setHelpOpen(false)} autoFocus variant={'outlined'}>
    //                         Close
    //                     </Button>
    //                 </DialogActions>
    //             </Dialog>
    //         </>
    //     );
    // };

    const renderSaveLayoutButton = () => {
        return (
            <>
                <Tooltip
                    arrow
                    placement={'bottom-end'}
                    componentsProps={{
                        popper: { sx: { maxWidth: 'unset' } },
                        tooltip: { sx: { maxWidth: 'unset' } },
                    }}
                    sx={{ display: { xs: 'none', sm: 'none', md: 'block', color: '#fff' } }}
                    title={'Save Layout'}
                >
                    <IconButton
                        onClick={() => setSaveLayoutOpen((saveLayoutOpen) => !saveLayoutOpen)}
                        sx={{ height: '40px', color: '#fff' }}
                    >
                        <SaveAltIcon />
                    </IconButton>
                </Tooltip>
                <Dialog
                    open={saveLayoutOpen}
                    onClose={(saveLayoutOpen) => !saveLayoutOpen}
                    PaperProps={{
                    component: 'form',
                    onSubmit: (event) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        const formJson = Object.fromEntries(formData.entries());
                        const layoutState = JSON.parse(localStore.getItem(LAYOUT_STORAGE_KEY))
                        const itemsState = JSON.parse(localStore.getItem(ITEMS_STORAGE_KEY))
                        const presetValues = {
                            name: formJson.layoutName,
                            layout: JSON.stringify(layoutState),
                            items: JSON.stringify(itemsState),
                        };
                        savePreset(presetValues);
                        setSaveLayoutOpen(false);
                    },
                    }}
                >
                    <DialogTitle>Save Layout</DialogTitle>
                    <DialogContent>
                    <DialogContentText>
                        Save your current layout and share with the homies!
                    </DialogContentText>
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="name"
                        name="layoutName"
                        label="Layout Name"
                        type="text"
                        fullWidth
                        variant="standard"
                    />
                    </DialogContent>
                    <DialogActions>
                    <Button onClick={() => setSaveLayoutOpen(false)}>Cancel</Button>
                    <Button type="submit">Save</Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    };

    return (
        <AppBar ref={appBarRef} position={'static'} color={'transparent'} sx={{ zIndex: 1 }}>
            <Toolbar>
                {renderLogo()}
                {renderToolbarComponents()}
                {renderSaveLayoutButton()}
                <Tooltip
                    arrow
                    placement={'bottom-end'}
                    componentsProps={{
                        popper: { sx: { maxWidth: 'unset' } },
                        tooltip: { sx: { maxWidth: 'unset' } },
                    }}
                    sx={{ display: { xs: 'none', sm: 'none', md: 'block', color: '#fff' } }}
                    title={'Help'}
                >
                    <IconButton
                        onClick={() => setReplayTutorial()}
                        sx={{ height: '40px', color: '#fff' }}
                    >
                        <HelpIcon  />    
                    </IconButton>
                </Tooltip>
                {/* {renderHelpButton()} */}
            </Toolbar>
            <div
                style={{
                    width: '100%',
                    height: '2px',
                    background: 'linear-gradient(130deg,#E8028C,#af002d 41.07%,#27388F 76.05%)',
                }}
            ></div>
        </AppBar>
    );
};
