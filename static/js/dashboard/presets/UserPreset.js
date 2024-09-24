import React, {useState} from 'react';
import { Typography, Dialog, DialogTitle, DialogContent, DialogContentText } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import IosShareIcon from '@mui/icons-material/IosShare';
import { removePreset } from '../../api/apexApi';

export default function UserPreset(props) {
    const [open, setOpen] = useState(false);

    return(
        
            <div 
                style={{
                    width:'100%', 
                    height: '50px', 
                    background: 'rgba(0,0,0, 0.1)', 
                    padding: '10px', 
                    marginBottom:'5px', 
                    boxSizing:'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                        "&:hover": {
                 background: "#efefef"
                    },
                    }}
                   
            >
                <Typography 
                sx={{fontWeight: '600', fontSize: '14px'}}
                onClick={() => {

                    const layoutItems = JSON.parse(props.preset.items);
                    props.setItems(props.addLayoutItems([]));
                    props.setItems(props.addLayoutItems(layoutItems));
                    props.loadLayout(JSON.stringify({lg:[]}));
                    props.loadLayout(props.preset.layout);
                    props.setOpen(props.openState.CLOSED);
                }}
                >
                    {props?.preset?.name}
                </Typography>
                {props.share ?
                <div style={{display: 'flex',
                    alignItems: 'center'}}>
                    <IosShareIcon onClick={(event) => {
                        event.preventDefault();
                        setOpen(true);
                        alert(`layout key: ${props.preset._id}`)
                    }} />
                    <DeleteIcon style={{marginTop:'5px'}} onClick={(event) => {
                        event.preventDefault();
                        removePreset({presetID: props.preset._id})
                        .then((result) => {
                            props.setUpdate(props.preset._id);
                        })
                        
                    }} />
                </div>
                : null}
                <Dialog onClose={() => setOpen(!open)} open={open}>
                    <DialogTitle>Share Key For: {props.preset.name}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {props.preset._id}
                        </DialogContentText>
                    </DialogContent>
                </Dialog>
            </div>
    )
}
