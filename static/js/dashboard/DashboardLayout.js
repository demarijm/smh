import {
    Badge,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Tooltip,
    useMediaQuery,
    useTheme,
    Typography,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import { getAllItems } from './dashboardItems';
import { MAX_ITEMS, OPEN_STATE } from './editor/dashboardEditorUtils';
import { ComponentEditor } from './editor/ComponentEditor';
import { ComponentEditorMobile } from './editor/ComponentEditorMobile';
import { isNewModule, setNewModule } from '../util/localStorageUtils';
import { logToServer } from '../api/apexApi';
import PresetsLayout from './presets/PresetsLayout';


export const DashboardLayout = ({ initialItems, setItems, loadLayout }) => {
    const [open, setOpen] = useState(OPEN_STATE.CLOSED);
    const [itemsChoice, setItemsChoice] = useState(initialItems);

    
    useEffect(() => {
        setItemsChoice(initialItems);
        if (OPEN_STATE.OPENING === open) {
            // This two step process is used to prevent the items from animating on dialog open
            setOpen(OPEN_STATE.OPEN);
            setNewModule();
        }
    }, [initialItems, open]);


    const generateUniqueId = (newId) => {
        const oldLen = itemsChoice.filter((item) => item.id.startsWith(newId)).length;
        return newId + oldLen;
    };

    const addLayoutItems = (newItems) => {
        const newLayoutItems = []
        for (var i = 0; i < newItems.length; i++) {
            const newItem = getItemIDs(newItems[i].id.replace(/[0-9]/g, ''));
            newLayoutItems.push(newItem);
        }
        setItemsChoice(newLayoutItems);
        return newLayoutItems;
    };

    const getItemIDs = (newItemValue) => {
        const newItem = { ...getAllItems().filter((item) => newItemValue === item.id)[0] };
        newItem.id = generateUniqueId(newItem.id);
        return newItem;
    };

    const addItem = (newItemValue) => {
        if (newItemValue && itemsChoice.length < MAX_ITEMS) {
            const newItem = { ...getAllItems().filter((item) => newItemValue === item.id)[0] };
            newItem.id = generateUniqueId(newItem.id);
            setItemsChoice((oldItemsChoice) => [...oldItemsChoice, newItem]);
            logToServer('info', { action: 'add component', component: newItem.title });
            return [...itemsChoice, newItem];
        }
        return itemsChoice;
    };

    const addItemFromList = (newItemValue) => {
        const newItemList = []
        newItemValue.forEach(element => {
            var newItemString = element.id.replace(/[0-9]/g, '');
            const newItem = { ...getAllItems().filter((item) => newItemString === item.id)[0] };
            const oldLen = newItemList.filter((item) => item.id.startsWith(newItem.id)).length;
            newItem.id = newItem.id + oldLen
            newItemList.push(newItem);
        });
        setItemsChoice(newItemList);
        setItems(newItemList);
    };

    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down('sm'));
    const onSave = useRef(undefined);

    return (
        <>
            <Dialog
                open={[OPEN_STATE.OPENING, OPEN_STATE.OPEN].includes(open)}
                onClose={() => setOpen(OPEN_STATE.CLOSED)}
                PaperProps={{ sx: { backgroundColor:'rgba(0, 0, 0, 0.95)' } }}
                fullScreen={true}
                
            >
                <DialogTitle sx={{ fontWeight: '600', backgroundColor:'rgba(rgba(0, 226, 114, 0.95)', textAlign: isXs ? 'center' : 'left' }}>Edit Dashboard Components</DialogTitle>
                <DialogContent
                    sx={{
                        overflow: 'hidden',
                        display: 'flex',
                        marginTop: '10px',
                        boxSizing: 'border-box',
                        flexDirection: isXs ? 'column' : 'row',
                        justifyContent: 'space-between'
                    }}
                >
                    <div style={{
                        height: '100%',
                        width: isXs ? '100%' : '50%',
                        background: 'rgba(255,255,255, 0.2)',
                        borderRadius: isXs ? '5px 5px 0 0' : '5px 0 0 5px',
                        display: 'flex',
                        padding: '10px',
                        boxSizing: 'border-box',
                        flexDirection: 'column',
                    }}>
                        <PresetsLayout loadLayout={loadLayout} addItemFromList={addItemFromList} addLayoutItems={addLayoutItems} setOpen={setOpen} openState={open}   />
                    </div>
                    

                    <div style={{
                        height: '100%',
                        width: isXs ? '100%' : '50%',
                        padding: '10px',
                        boxSizing: 'border-box',
                        background: 'rgba(255,255,255, 0.1)',
                        borderRadius: isXs ? '0 0 5px 5px' : '0 5px 5px 0',
                        borderBox: 'box-sizing',
                        overflowY: 'scroll',
                    }}>
                        {isXs ? (
                            <>
                                <Typography sx={{ marginTop: '5px', width: '100%', fontWeight: '600', fontSize: '18px', textAlign: isXs ? 'center' : 'left' }}>
                                    Add Module
                                </Typography>
                                <ComponentEditorMobile
                                    itemsChoice={itemsChoice}
                                    setItemsChoice={setItemsChoice}
                                    addItem={addItem}
                                    open={open}
                                    onSave={onSave}
                                />
                            </>
                    ) : (
                        <ComponentEditor
                            itemsChoice={itemsChoice}
                            setItemsChoice={setItemsChoice}
                            addItem={addItem}
                            open={open}
                        />
                    )}

                    </div>

                   
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(OPEN_STATE.CLOSED)}>Cancel</Button>

                    <Button
                        onClick={() => {
                            const newItemsChoice = isXs ? onSave.current() : addItem();
                            setItems(newItemsChoice);
                            setOpen(OPEN_STATE.CLOSED);
                        }}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
            <Tooltip title={'Edit Dashboard Components'} arrow>
                <IconButton onClick={() => setOpen(OPEN_STATE.OPENING)} sx={{ color: '#fff' }}>
                    <Badge variant={'dot'} color={'warning'} invisible={!isNewModule()}>
                        <SettingsIcon />
                    </Badge>
                </IconButton>
            </Tooltip>
        </>
    );
};




