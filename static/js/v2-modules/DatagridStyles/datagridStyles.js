export const datagridStyles = {
    color: '#fff',
    width: '100%',
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontWeight: 600,
    border: 0,
    '& .MuiDataGrid-cell': {
        minHeight: '30px',
        border: 0,
    },
    '& .MuiDataGrid-columnHeaders': {
        borderBottom: 0,
        background: 'rgba(0,0,0,0.3)',
        borderRadius: 0,
        '& .MuiDataGrid-columnHeaderTitle': {
            fontSize: '12px',
            fontWeight: '600',
            color: '#fff',
            textTransform: 'uppercase',
        },
    },
    '& .MuiDataGrid-iconSeparator': {
        display: 'none',
    },
    '& .MuiDataGrid-virtualScrollerRenderZone': {
        '& .MuiDataGrid-row': {
            backgroundImage: 'radial-gradient(circle,rgba(255, 255, 255, .05), rgba(0, 0, 0, .00))',
            '&:nth-of-type(2n)': {
                backgroundImage:
                    'radial-gradient(circle,rgba(255, 255, 255, .07), rgba(0, 0, 0, .00))',
            },
        },
    },
    '& .MuiDataGrid-overlayWrapper': {
        height: '52px',
    },
};
