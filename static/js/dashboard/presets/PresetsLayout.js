import React, {useState} from 'react';
import Grid2 from '@mui/material/Unstable_Grid2';
import { Typography,
            Button,
            Dialog,
            DialogActions,
            DialogContent,
            DialogContentText,
            DialogTitle,
            useMediaQuery,
            useTheme,
            TextField, } from '@mui/material';

import { StatusOverlay } from '../../infrastructure/StatusOverlay';
import TraderlinkPreset from './TraderlinkPreset';
import UserPreset from './UserPreset';
import { loadPresets, loadSharedPreset } from '../../api/apexApi';
import { useQuery } from 'react-query';
// import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';



export default function PresetsLayout(props) {
    
   
    const [update, setUpdate] = useState(null)
    const [saveLayoutOpen, setSaveLayoutOpen] = useState(false);

    const {
        isFetching: loading,
        error,
        data: queryData,
    } = useQuery(
        ['loadPresets', update],
        () =>
            loadPresets()
                .then((result) => {
                    if (result) {
                        return {
                            presetData: result,
                        };
                    } else {
                        throw new Error('Server error, please try again later.');
                    }
                }
        )
    );
    const { presetData } = queryData || { presetData: {traderlinkPresets: [], userPresets:[]} };

    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down('sm'));


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
            <StatusOverlay  error={error} loading={loading || !presetData} />
            <Grid2
                container
                maxWidth={'100%'}
                padding={'8px'}
                height={'100%'}
                sx={{ overflowY: isXs ? 'auto' : 'hidden' }}
            >

                <Typography sx={{ marginTop: '5px', width: '100%', fontWeight: '600', fontSize: '18px', textAlign: isXs ? 'center' : 'left' }}>
                    Traderlink Layouts
                </Typography>
                <div style={{
                    width: '100%',
                    height: isXs ? '50%' : 'auto',
                    display: 'flex',
                    padding: '10px',
                    boxSizing: 'border-box',
                    justifyContent: isXs ? 'center' : 'stretch',
                    flexDirection: isXs ? 'column' : 'row',
                }}>
                    { isXs ? presetData.traderlinkPresets.map((preset) =>
                     <UserPreset share={false} preset={preset} key={preset._id} loadLayout={props.loadLayout} setItems={props.addItemFromList} setOpen={props.setOpen} openState={props.openState} addLayoutItems={props.addLayoutItems} />
                    ): 
                    presetData.traderlinkPresets.map((preset) =>
                     <TraderlinkPreset preset={preset} key={preset._id} loadLayout={props.loadLayout} setItems={props.addItemFromList} setOpen={props.setOpen} openState={props.openState} addLayoutItems={props.addLayoutItems} />
                    )}
                </div>

                <Typography sx={{ marginTop: '5px', width: '100%', fontWeight: '600', fontSize: '18px', textAlign: isXs ? 'center' : 'left', display:'flex', alignItems:'center', justifyContent: isXs ? 'center' : 'space-between' }}>
                    My Layouts <Button style={{cursor: 'pointer'}} onClick={() => setSaveLayoutOpen((saveLayoutOpen) => !saveLayoutOpen)}>Load Layout</Button>
                </Typography>
                <div style={{
                // background: '#ccc',
                height: isXs ? '50%' : '70%',
                width: '100%',
                display: 'flex',
                padding: '10px',
                boxSizing: 'border-box',
                flexDirection: 'column',
                }}>
                    {presetData.userPresets.map((preset) =>
                        <UserPreset share={true} preset={preset} key={preset._id} setUpdate={setUpdate} loadLayout={props.loadLayout} setItems={props.addItemFromList} setOpen={props.setOpen} openState={props.openState} addLayoutItems={props.addLayoutItems} />
                    )}
                </div>
            </Grid2>
            <Dialog
                    open={saveLayoutOpen}
                    onClose={(saveLayoutOpen) => !saveLayoutOpen}
                    PaperProps={{
                    component: 'form',
                    onSubmit: (event) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        const formJson = Object.fromEntries(formData.entries());
                        loadSharedPreset({presetID: formJson.layoutID})
                        .then((result) => {
                            setUpdate(formJson.layoutID);
                        })
                        setSaveLayoutOpen(false);
                    },
                    }}
                >
                    <DialogTitle>Load Layout</DialogTitle>
                    <DialogContent>
                    <DialogContentText>
                        Load Your Homies Layout Dawg.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="name"
                        name="layoutID"
                        label="Layout Key"
                        type="text"
                        fullWidth
                        variant="standard"
                    />
                    </DialogContent>
                    <DialogActions>
                    <Button onClick={() => setSaveLayoutOpen(false)}>Cancel</Button>
                    <Button type="submit">Load</Button>
                    </DialogActions>
                </Dialog>
        </div>
    );
}
