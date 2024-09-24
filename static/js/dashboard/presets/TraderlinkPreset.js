import React from 'react';
import { Typography } from '@mui/material';


const backgroundImage = 'https://traderlink.io/wp-content/uploads/2023/11/Screenshot-2023-11-18-at-18-12-23-Dashboard-•-Traderlink.png';

export default function TraderlinkPreset(props) {

return (

    <div 
    style={{
        width:'100%', 
        height: '150px', 
        margin: '10px', 
        borderRadius: '5px', 
        padding: '8px',
        boxSizing:'border-box',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        background: `linear-gradient(0deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.9)), url(${props.presets?.backgroundImage || backgroundImage})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        cursor: 'pointer',
        fontSize: '20px',
    }}
    onClick={() => {
        const layoutItems = JSON.parse(props.preset.items);
        props.setItems(props.addLayoutItems([]));
        props.setItems(props.addLayoutItems(layoutItems));
        props.loadLayout(JSON.stringify({lg:[]}));
        props.loadLayout(props.preset.layout);
        props.setOpen(props.openState.CLOSED);
    }}

    >
        <Typography sx={{fontWeight: '600', fontSize: '12px' }}>
            {props?.preset?.name}
        </Typography>
    </div>
    
)
}

