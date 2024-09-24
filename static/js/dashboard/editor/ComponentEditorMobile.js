import { IconButton, ListItem, ListItemText, MenuItem, Select } from '@mui/material';
import { MAX_ITEMS, removeItemOnce } from './dashboardEditorUtils';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAllItems } from '../dashboardItems';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';

export const ComponentEditorMobile = ({ itemsChoice, setItemsChoice, addItem, open, onSave }) => {
    const [newItemValue, setNewItemValue] = useState('');

    useEffect(() => {
        setNewItemValue('');
    }, [open]);

    const saveNewItem = () => {
        if (newItemValue) {
            addItem(newItemValue);
            setNewItemValue('');
        }
    };
    // Flush the newItemValue on save
    onSave.current = () => (newItemValue ? addItem(newItemValue) : itemsChoice);

    const renderListItems = () => {
        const items = itemsChoice.map((item, index) => (
            <ListItem
                key={item.id}
                sx={{ height: '48px', overflowY: 'hidden' }}
                secondaryAction={
                    <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() =>
                            setItemsChoice((oldItems) => [...removeItemOnce(oldItems, index)])
                        }
                    >
                        <DeleteIcon />
                    </IconButton>
                }
            >
                <ListItemText>{item.title}</ListItemText>
            </ListItem>
        ));

        if (items.length < MAX_ITEMS) {
            items.push(
                <ListItem
                    key={'addNew'}
                    sx={{ height: '48px' }}
                    secondaryAction={
                        <IconButton edge={'end'} onClick={saveNewItem}>
                            <AddIcon />
                        </IconButton>
                    }
                >
                    <Select
                        variant={'standard'}
                        fullWidth
                        value={newItemValue}
                        onChange={(event) => setNewItemValue(event.target.value)}
                    >
                        {getAllItems().map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                                {item.title}
                            </MenuItem>
                        ))}
                    </Select>
                </ListItem>,
            );
        }
        return items;
    };

    return renderListItems();
};
